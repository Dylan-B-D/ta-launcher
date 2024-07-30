import { IconType } from "react-icons";

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

export interface Field {
    type: string;
    key: string;
    displayName: string;
    description: string;
}

export interface Config {
    gamePath: string;
    loginServer: string;
    launchMethod: string;
    dllVersion: string;
    dpi: number;
    units: string;
}

export interface SensitivityCalculatorProps {
    mouseSensitivity: number;
    FOVSetting: number;
    dpi: number;
    onDpiChange: (value: number) => void;
    onSensitivityChange: (value: number) => void;
}

export interface CardGradientProps {
    icon?: IconType;
    image?: string;
    gradient: {
        deg: number;
        from: string;
        to: string;
    };
    title: string;
    description: string;
    link: string;
}

export interface Notification {
    visible: boolean;
    message: string;
    title: string;
    color: string;
    icon: JSX.Element | null;
}
