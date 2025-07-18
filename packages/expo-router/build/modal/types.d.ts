import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { type ViewProps } from 'react-native';
export interface ModalConfig {
    component: React.ReactNode;
    parentNavigationProp: NavigationProp<ParamListBase>;
    uniqueId: string;
    animationType?: 'slide' | 'fade' | 'none';
    presentationStyle?: 'fullScreen' | 'overFullScreen' | 'pageSheet' | 'formSheet';
    transparent?: boolean;
    viewProps?: ViewProps;
    detents?: number[] | 'fitToContents';
<<<<<<< HEAD
    initialDetentIndex?: number | 'last';
    cornerRadius?: number;
    footer?: () => React.ReactNode;
}
export interface DetentChangeData {
    index: number;
    stable: boolean;
=======
    largestUndimmedDetentIndex?: number | 'none' | 'last';
>>>>>>> feat/expo-router-modal-largest-undimmed-detent
}
export interface ModalsRendererProps {
    children?: React.ReactNode;
    modalConfigs: ModalConfig[];
    onDismissed?: (id: string) => void;
    onShow?: (id: string) => void;
    onDetentChange?: (id: string, data: DetentChangeData) => void;
}
//# sourceMappingURL=types.d.ts.map