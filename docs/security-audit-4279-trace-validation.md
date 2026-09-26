# CI trace validation (#4279)

An isolated, intentionally failing Chromium test under Playwright 1.62.1 retained an 11,542-byte `trace.zip`. Dummy password markers appeared in trace text and resource files; a dummy token marker also appeared in `0-trace.network`. This confirms marker retention in the tested trace, not a real credential leak.

With CI tracing and video disabled, the same failure left no dummy markers in the three result files or three HTML report files inspected. The assertion, screenshot, page snapshot, source excerpt, and HTML report remained available.

The probe used a scratch config and test, an allowlisted environment, locally fulfilled loopback requests, denied outside networking, scratch-only writes, one worker, a 15-second test timeout, a 45-second process limit, and bounded artifact inspection. It did not inspect historical CI artifacts.

The repository owner still needs to verify artifact readers (including fork contributors), retention and deletion policy, credential validity or rotation during retention, and the test account's permissions and data scope. No unauthorized artifact reader was established.
