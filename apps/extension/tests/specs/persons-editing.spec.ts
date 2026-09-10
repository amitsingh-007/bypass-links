import {
  EStorageKey,
  getPersonImageName,
  type PersonImageUrls,
} from '@bypass/shared';
import {
  closeDialog,
  failProcedure,
  routeTrpcProcedure,
  succeedProcedure,
  TEST_PERSON_NAME,
  TEST_PERSONS,
  TEST_SITES,
} from '@bypass/shared/tests';
import {
  expect,
  test,
  type BrowserContext,
  type Locator,
  type Page,
} from '@playwright/test';

import { openExtensionPanelPage } from '../fixtures/base-fixture';
import { PersonsPanel } from '../utils/persons-panel';
import { withSignedInProfile } from '../utils/signed-in-profile';
import {
  getPersonUids,
  getStorageItem,
  seedFolderWithBookmarks,
} from '../utils/test-utils';

/** A 1x1 png, small enough to paste, type and serve as itself. */
const IMAGE_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAgMBgN0m4ZUAAAAASUVORK5CYII=';
const IMAGE_BYTES = Buffer.from(IMAGE_DATA_URL.split(',')[1], 'base64');

/** Stands in for the account's storage bucket for the whole spec. */
const STORED_IMAGE_URL = 'https://person-image.test/e2e-person.png';
const BROKEN_IMAGE_URL = 'https://person-image.test/missing.png';

type FailureKey = 'upload' | 'downloadUrl' | 'remove';

/**
 * Uploads, download urls and file deletions are all answered here, so an image
 * test can never add to or delete from the shared account's storage bucket. The
 * counters are what prove the interception happened rather than being assumed.
 */
const controlPersonImages = async (context: BrowserContext) => {
  const uploads: string[] = [];
  const removals: unknown[] = [];
  const failing: Record<FailureKey, boolean> = {
    upload: false,
    downloadUrl: false,
    remove: false,
  };

  let heldUpload: Promise<void> | undefined;

  await context.route('**/api/upload-file', async (route) => {
    uploads.push(route.request().url());
    await heldUpload;
    if (failing.upload) {
      await route.abort();
      return;
    }
    await route.fulfill({ status: 200, contentType: 'text/plain', body: 'ok' });
  });
  // Fetched by the cache warm-up that follows every saved image
  await context.route(STORED_IMAGE_URL, async (route) => {
    await route.fulfill({ contentType: 'image/png', body: IMAGE_BYTES });
  });
  await context.route(BROKEN_IMAGE_URL, async (route) => {
    await route.fulfill({ status: 404, contentType: 'text/plain', body: '' });
  });
  await routeTrpcProcedure(context, 'storage.getDownloadUrl', async (call) => {
    if (failing.downloadUrl) {
      await failProcedure(call);
      return;
    }
    await succeedProcedure(call, STORED_IMAGE_URL);
  });
  await routeTrpcProcedure(context, 'storage.removeFile', async (call) => {
    removals.push(call.input);
    if (failing.remove) {
      await failProcedure(call);
      return;
    }
    await succeedProcedure(call, null);
  });

  return {
    uploads: () => uploads,
    removals: () => removals,
    setFailing: (key: FailureKey, isFailing: boolean) => {
      failing[key] = isFailing;
    },
    /** Holds the next upload open, so its in-flight state can be asserted. */
    holdUploads: () => {
      let release: (() => void) | undefined;
      heldUpload = new Promise<void>((resolve) => {
        release = resolve;
      });
      return () => {
        heldUpload = undefined;
        release?.();
      };
    },
  };
};

/** `file` is a data url, turned into a real `File` inside the page. */
type PasteContent = { text: string } | { file: string };

/**
 * Dispatched from inside the page: the picker reads the event's own
 * clipboardData, and `dispatchEvent` cannot carry a ClipboardEvent's.
 */
const pasteIntoInput = async (input: Locator, content: PasteContent) => {
  await input.evaluate(async (element, pasted: PasteContent) => {
    const transfer = new DataTransfer();
    if ('file' in pasted) {
      const blob = await (await fetch(pasted.file)).blob();
      transfer.items.add(new File([blob], 'person.png', { type: blob.type }));
    } else {
      transfer.setData('text', pasted.text);
    }
    element.dispatchEvent(
      new ClipboardEvent('paste', {
        clipboardData: transfer,
        bubbles: true,
        cancelable: true,
      })
    );
  }, content);
};

const getStoredImageUrl = async (page: Page, uid: string) =>
  (await getStorageItem<PersonImageUrls>(page, EStorageKey.personImageUrls))?.[
    uid
  ];

const openPersonsPanel = async (
  context: BrowserContext,
  extensionId: string
) => {
  const page = await openExtensionPanelPage(context, extensionId, 'persons');
  const panel = new PersonsPanel(page);
  await expect(panel.getPersonItems().first()).toBeVisible();
  return { page, panel };
};

const uniqueName = (suffix: string) =>
  `${TEST_PERSON_NAME}-${suffix}-${Date.now()}`;

test.describe('Persons editing and ordering', () => {
  /**
   * Recency is the default-folder order, newest last, so the person tagged on
   * the folder's last bookmark leads the panel. Alphabetically Akash would.
   */
  test('orders persons by the default folder, and alphabetically without it', async () => {
    await withSignedInProfile(async ({ context, extensionId }) => {
      const { page, panel } = await openPersonsPanel(context, extensionId);
      const uids = await getPersonUids(page);

      await seedFolderWithBookmarks(
        page,
        'E2E Recency',
        [
          {
            title: 'tagged first',
            url: `${TEST_SITES.EXAMPLE_COM}/oldest`,
            taggedPersons: [uids[TEST_PERSONS.DONALD]],
          },
          {
            title: 'tagged last',
            url: `${TEST_SITES.EXAMPLE_COM}/newest`,
            taggedPersons: [uids[TEST_PERSONS.JOHN_NATHAN]],
          },
        ],
        { isDefault: true }
      );
      await panel.ensureAtRoot();

      await expect
        .poll(async () => (await panel.getPersonNames()).slice(0, 2))
        .toEqual([TEST_PERSONS.JOHN_NATHAN, TEST_PERSONS.DONALD]);

      await page.getByTestId('recency-switch').click();

      const names = await panel.getPersonNames();
      expect(names).toEqual(
        names.toSorted((left, right) => left.localeCompare(right))
      );
    });
  });

  test('replaces a person image and keeps it after reopening', async () => {
    await withSignedInProfile(async ({ context, extensionId }) => {
      const imageRoutes = await controlPersonImages(context);
      const { page, panel } = await openPersonsPanel(context, extensionId);
      const uid = (await getPersonUids(page))[TEST_PERSONS.DONALD];

      await panel.changePersonImage(TEST_PERSONS.DONALD, IMAGE_DATA_URL);

      expect(imageRoutes.uploads()).toHaveLength(1);
      await expect
        .poll(async () => getStoredImageUrl(page, uid))
        .toBe(STORED_IMAGE_URL);

      await panel.ensureAtRoot();
      await panel.verifyAvatarVisibleInEditDialog(TEST_PERSONS.DONALD);
      expect(await getStoredImageUrl(page, uid)).toBe(STORED_IMAGE_URL);
    });
  });

  test('drops the image mapping when the person is deleted', async () => {
    await withSignedInProfile(async ({ context, extensionId }) => {
      const imageRoutes = await controlPersonImages(context);
      const { page, panel } = await openPersonsPanel(context, extensionId);
      const name = uniqueName('image-delete');

      await panel.addPerson(name, IMAGE_DATA_URL);
      const uid = (await getPersonUids(page))[name];
      expect(await getStoredImageUrl(page, uid)).toBe(STORED_IMAGE_URL);

      await panel.deletePerson(name);

      expect(imageRoutes.removals()).toEqual([getPersonImageName(uid)]);
      await expect
        .poll(async () => getStoredImageUrl(page, uid))
        .toBeUndefined();
    });
  });

  test('accepts a pasted url and a pasted image file', async () => {
    await withSignedInProfile(async ({ context, extensionId }) => {
      await controlPersonImages(context);
      const { page, panel } = await openPersonsPanel(context, extensionId);
      const { imagePicker } = await panel.openImagePicker(TEST_PERSONS.DONALD);
      const urlInput = panel.getPickerUrlInput();

      await test.step('pasted text lands in the url field', async () => {
        await pasteIntoInput(urlInput, { text: IMAGE_DATA_URL });

        await expect(urlInput).toHaveValue(IMAGE_DATA_URL);
        await expect(panel.getPickerSaveButton()).toBeEnabled();
      });

      await test.step('a pasted image file is taken instead of the field', async () => {
        await urlInput.fill('');
        // Debounced, so without this the Save below could still be the last one
        await expect(panel.getPickerSaveButton()).toBeDisabled();

        await pasteIntoInput(urlInput, { file: IMAGE_DATA_URL });

        // The file never becomes text, so an enabled Save is the only signal
        await expect(urlInput).toHaveValue('');
        await expect(panel.getPickerSaveButton()).toBeEnabled();
      });

      await closeDialog(page, imagePicker);
    });
  });

  test('zooms and rotates the crop from the keyboard', async () => {
    await withSignedInProfile(async ({ context, extensionId }) => {
      await controlPersonImages(context);
      const { page, panel } = await openPersonsPanel(context, extensionId);
      const { imagePicker } = await panel.openImagePicker(TEST_PERSONS.DONALD);

      await panel.getPickerUrlInput().fill(IMAGE_DATA_URL);
      await expect(panel.getPickerSaveButton()).toBeEnabled();

      for (const label of ['zoom', 'rotate']) {
        await test.step(label, async () => {
          // The thumb's own control carries the value, and has no name of its own
          const slider = imagePicker
            .getByTestId(`${label}-slider`)
            .getByRole('slider');
          const before = Number(await slider.getAttribute('aria-valuenow'));

          await slider.press('ArrowRight');

          await expect
            .poll(async () =>
              Number(await slider.getAttribute('aria-valuenow'))
            )
            .toBeGreaterThan(before);
        });
      }

      await closeDialog(page, imagePicker);
    });
  });

  test('recovers in the picker after an image fails to load', async () => {
    await withSignedInProfile(async ({ context, extensionId }) => {
      await controlPersonImages(context);
      const { page, panel } = await openPersonsPanel(context, extensionId);
      const uid = (await getPersonUids(page))[TEST_PERSONS.DONALD];
      const imageUrlBefore = await getStoredImageUrl(page, uid);
      const { imagePicker } = await panel.openImagePicker(TEST_PERSONS.DONALD);
      const saveButton = panel.getPickerSaveButton();
      const urlInput = panel.getPickerUrlInput();

      await urlInput.fill(BROKEN_IMAGE_URL);

      // The spinner is what proves the url was taken: Save is also disabled on
      // an untouched picker, so on its own it would prove nothing
      await expect(
        imagePicker.getByRole('status', { name: 'Loading' })
      ).toBeVisible();
      await expect(saveButton).toBeDisabled();
      expect(await getStoredImageUrl(page, uid)).toBe(imageUrlBefore);

      await urlInput.fill(IMAGE_DATA_URL);

      await expect(saveButton).toBeEnabled();
      await expect(
        imagePicker.getByRole('status', { name: 'Loading' })
      ).toBeHidden();
      await closeDialog(page, imagePicker);
      await panel.verifyPersonExists(TEST_PERSONS.DONALD);
    });
  });

  test('keeps the image recoverable when the upload fails', async () => {
    await withSignedInProfile(async ({ context, extensionId }) => {
      const imageRoutes = await controlPersonImages(context);
      imageRoutes.setFailing('upload', true);
      const { page, panel } = await openPersonsPanel(context, extensionId);
      const uid = (await getPersonUids(page))[TEST_PERSONS.DONALD];
      const imageUrlBefore = await getStoredImageUrl(page, uid);
      expect(
        imageUrlBefore,
        'the fixture person has no stored image for this to preserve'
      ).toBeDefined();
      const { dialog, imagePicker } = await panel.openImagePicker(
        TEST_PERSONS.DONALD
      );
      const releaseUpload = imageRoutes.holdUploads();

      await panel.getPickerUrlInput().fill(IMAGE_DATA_URL);
      await panel.getPickerSaveButton().click();

      await test.step('the upload is reported while it is in flight', async () => {
        await expect(page.getByTestId('uploading-overlay')).toBeVisible();
        releaseUpload();
      });

      await test.step('the picker stays open and the image is unchanged', async () => {
        await expect(page.getByTestId('uploading-overlay')).toBeHidden();
        await expect(imagePicker).toBeVisible();
        expect(imageRoutes.uploads()).toHaveLength(1);
        expect(await getStoredImageUrl(page, uid)).toBe(imageUrlBefore);
      });

      await test.step('retrying uploads the image and saves it with the person', async () => {
        imageRoutes.setFailing('upload', false);
        await panel.getPickerSaveButton().click();
        await expect(imagePicker).toBeHidden();

        // The picker only updates the open dialog; the mapping is written on save
        await dialog.getByRole('button', { name: 'Save' }).click();
        await expect(dialog).toBeHidden();
        await expect
          .poll(async () => getStoredImageUrl(page, uid))
          .toBe(STORED_IMAGE_URL);
      });
    });
  });

  test('keeps the list intact when saving a person fails, and saves on retry', async () => {
    await withSignedInProfile(async ({ context, extensionId }) => {
      const imageRoutes = await controlPersonImages(context);
      imageRoutes.setFailing('downloadUrl', true);
      const { page, panel } = await openPersonsPanel(context, extensionId);
      const namesBefore = await panel.getPersonNames();
      const name = uniqueName('failed-save');

      const dialog = await panel.openAddPersonDialog();
      await dialog.getByPlaceholder('Enter name').fill(name);
      await dialog.getByRole('button', { name: 'Save' }).click();

      await test.step('the failure is reported and nothing is added', async () => {
        await expect(page.getByText(`Could not save ${name}`)).toBeVisible();
        await expect(panel.getPersonCardElement(name)).toHaveCount(0);
        expect(await panel.getPersonNames()).toEqual(namesBefore);
      });

      await test.step('retrying adds the person', async () => {
        imageRoutes.setFailing('downloadUrl', false);
        await panel.addPerson(name);

        await panel.ensureAtRoot();
        await panel.verifyPersonExists(name);
      });
    });
  });

  test('keeps the person when the deletion fails, and deletes on retry', async () => {
    await withSignedInProfile(async ({ context, extensionId }) => {
      const imageRoutes = await controlPersonImages(context);
      const { page, panel } = await openPersonsPanel(context, extensionId);
      const name = uniqueName('failed-delete');

      await panel.addPerson(name, IMAGE_DATA_URL);
      const uid = (await getPersonUids(page))[name];
      imageRoutes.setFailing('remove', true);

      await panel.clickPersonContextMenu(name, 'delete');

      await test.step('the person and its image mapping survive', async () => {
        await expect(page.getByText(`Could not delete ${name}`)).toBeVisible();
        await panel.verifyPersonExists(name);
        expect(await getStoredImageUrl(page, uid)).toBe(STORED_IMAGE_URL);
      });

      await test.step('retrying deletes both', async () => {
        imageRoutes.setFailing('remove', false);
        await panel.deletePerson(name);

        await expect
          .poll(async () => getStoredImageUrl(page, uid))
          .toBeUndefined();
      });
    });
  });
});
