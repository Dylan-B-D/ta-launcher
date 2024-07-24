export interface FirstTimeSetupProps {
    onComplete: () => void;
}

export interface PackageDetails {
    id: string;
    displayName: string;
    description: string;
    version: string;
    objectKey: string;
    size: number;
    dependencies: string[];
    dependencyCount: number;
    isTopLevelPackage: boolean;
    totalSize: number;
    lastModified: string;
    hash: string;
}

export interface PackageNode {
    package: PackageDetails;
    dependencies: Record<string, PackageNode>;
}

export interface Packages {
    [key: string]: PackageNode;
}

export interface CheckConfigResult {
    exists: boolean;
}

export interface ReplaceConfigResult {
    message: string;
}

export interface ConfigFile {
    content: string;
    permissions: string;
}

export interface ConfigFilesResult {
    tribes_ini: ConfigFile;
    tribes_input_ini: ConfigFile;
}

export interface IniField {
    key: string;
    displayName: string;
    type: 'boolean' | 'number';
    description: string;
}