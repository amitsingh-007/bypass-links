import jsonfile from 'jsonfile';
import { PATHS } from '../webpack/constants';

const manifestFilePath = `${PATHS.EXTENSION}/manifest.json`;

const manifestFile = jsonfile.readFileSync(manifestFilePath);

//Replacing with prod oauth2 key
manifestFile['oauth2']['client_id'] =
  '603462573180-fevjvmbth5i8edtbgmsk2h9vo90dnv35.apps.googleusercontent.com';

jsonfile.writeFileSync(manifestFilePath, manifestFile);
