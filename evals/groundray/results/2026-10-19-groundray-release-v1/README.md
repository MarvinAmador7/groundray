# Groundray 0.2.1 release packaging checks

The [validation receipt](validation.json) records a native Linux CLI, the
25-operation local-remote collaboration smoke and install/reinstall using a
real isolated Codex 0.161.0 host. No model call or real employee-host role is
represented. The persistent install path contains spaces. Real-host migration removes the
old development registration only after validating the new one; another plugin
in that old marketplace remains installed with unchanged cached skill bytes.
The legacy registration fixture uses the current runtime and does not claim
an old-binary compatibility test. Failure-path tests
cover checksums, unsafe archive entries, runtime/version mismatch, active
profile/state preservation, host failure and disabled/missing plugin catalogs.

The [paired timing measurements](compatibility-timing.json) compare the old
helper from the merged main commit with the new helper using the same frozen
runtime and checksum verification. Each current check launches one runtime,
compared with eleven previously. Three Linux pairs measured 9.3–14.4 seconds
before and 0.80–0.88 seconds after. The VM also ran the test suite; these are
engineering observations, not isolated benchmarks or Mac performance claims.

Two preliminary installation-harness attempts lacked the directory for their
explicitly selected synthetic Codex home; another preservation fixture lacked
the Agent Plugin schema field. These fixture errors were corrected;
no real credentials/profile were substituted. Local raw attempts remain in the
task's build workspace. Existing participant traces and synthetic trial archives
were not edited. The latest publisher says hook failures are not reproducing;
the historical exit-127 cause remains unknown and no unrelated hooks were changed.

GitHub CI and the release workflow build/test the macOS/Linux Intel/ARM assets.
The package/CLI versions advance together so host caches receive each runtime
update. Human evidence inspection and Karol's real hosted handoff remain pending.

Local verification: 637 tests pass with 86.83% coverage and one optional real-QMD
skip; 22 current installer/package/distribution tests also pass after the final
host guards. Lint, shell syntax, workflow YAML/action pins and changed document
links pass. Final-tree GitHub CI is required before merge and publication.
