// Portable functions copied unchanged from Binzo's src/helpers/assets.ts.
// Revision e9c4b5acd9035166c79a7fc1baaf34cca70712c5 (MIT; see LICENSE).
// Only the type import, process-based currentMachine and terminal selectAsset are omitted.
import type { ReleaseAsset } from '../releases';

export type Machine = { platform: string; arch: string; libc?: "gnu" | "musl" };

const platforms: Record<string, string[]> = {
  darwin: ["darwin", "macos", "osx", "mac"],
  linux: ["linux"],
  win32: ["windows", "win32", "win64", "win"],
  freebsd: ["freebsd"],
  openbsd: ["openbsd"],
  android: ["android"],
  netbsd: ["netbsd"],
};

const architectures: Record<string, string[]> = {
  x64: ["x86_64", "x86-64", "amd64", "x64"],
  arm64: ["aarch64", "arm64", "arm64e"],
  ia32: ["i386", "i686", "ia32", "x86", "386"],
  arm: ["armv7l", "armv7", "armv6l", "armv6", "armhf", "arm"],
  riscv64: ["riscv64"],
  ppc64: ["ppc64le", "ppc64", "powerpc64"],
  s390x: ["s390x"],
  loong64: ["loongarch64", "loong64"],
};

const archiveSuffix = /\.(tar\.gz|tar\.bz2|tar\.xz|tgz|tbz2|txz|tar|zip|gz|bz2|xz)$/i;

export function archiveStem(name: string) {
  return name.replace(archiveSuffix, "");
}

function hasToken(name: string, token: string) {
  return new RegExp(`(^|[^a-z0-9])${token}([^a-z0-9]|$)`, "i").test(name);
}

function detect(name: string, groups: Record<string, string[]>) {
  // Consume longer aliases first: x86_64 must not also match x86, arm64 must not match arm.
  const aliases = Object.entries(groups)
    .flatMap(([group, tokens]) => tokens.map((token) => ({ group, token })))
    .sort((a, b) => b.token.length - a.token.length);

  const result = new Set<string>();
  let remaining = name.toLowerCase();

  for (const { group, token } of aliases) {
    if (!hasToken(remaining, token)) continue;

    result.add(group);
    remaining = remaining.replaceAll(token, " ");
  }

  return result;
}

export function assetMatch(name: string, machine: Machine): "exact" | "uncertain" | "incompatible" {
  const os = detect(name, platforms);
  const arch = detect(name, architectures);

  if (os.size && !os.has(machine.platform)) return "incompatible";

  const universal =
    machine.platform === "darwin" && (hasToken(name, "universal") || hasToken(name, "universal2"));

  if (arch.size && !arch.has(machine.arch) && !universal) return "incompatible";

  if (machine.platform === "linux" && machine.libc === "musl" && /\b(gnu|glibc)\b/i.test(name))
    return "incompatible";

  return os.has(machine.platform) && (arch.has(machine.arch) || universal) ? "exact" : "uncertain";
}

export function isInstallableAsset(name: string) {
  if (/(^|[._-])(checksums?|sha\d*|sources?|debug|symbols?|sbom|provenance)([._-]|$)/i.test(name))
    return false;

  if (
    /\.(sig|asc|sha\d*|txt|json|ya?ml|md|pdf|deb|rpm|dmg|pkg|msi|msix|appx|flatpak|blockmap|nupkg|sh|ps1|bat|cmd)$/i.test(
      name,
    )
  )
    return false;

  return (
    archiveSuffix.test(name) ||
    /\.(exe|bin|appimage)$/i.test(name) ||
    !/\.[a-z][a-z0-9]*$/i.test(name)
  );
}

export function assetChoices(assets: ReleaseAsset[], machine: Machine) {
  const supported = assets.filter(
    (asset) => isInstallableAsset(asset.name) && assetMatch(asset.name, machine) !== "incompatible",
  );
  const exact = supported.filter((asset) => assetMatch(asset.name, machine) === "exact");
  const candidates = exact.length ? exact : supported;

  // Equivalent compression formats are not a user decision. Prefer tar.gz.
  const formats = [".tar.gz", ".tgz", ".zip", ".tar.xz", ".tar.bz2"];
  const rank = (name: string) => {
    const index = formats.findIndex((format) => name.toLowerCase().endsWith(format));
    return index < 0 ? formats.length : index;
  };

  const unique = new Map<string, ReleaseAsset>();

  for (const asset of [...candidates].sort((a, b) => rank(a.name) - rank(b.name))) {
    const key = archiveStem(asset.name).toLowerCase();
    if (!unique.has(key)) unique.set(key, asset);
  }

  return [...unique.values()];
}
