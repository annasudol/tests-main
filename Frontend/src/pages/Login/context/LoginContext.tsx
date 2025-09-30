import * as React from "react";
import {createContext, useContext, FC, ReactNode, useState} from "react";
import {DialogType} from "../constants";

export interface LoginContextValues {
    openDialog: DialogType | null;
    onOpenDialog: (dialog: DialogType) => void;
    onCloseDialog: () => void;
    rememberMe: boolean;
    setRememberMe: (value: boolean) => void;
}

const LoginContext = createContext<LoginContextValues | null>(null);

export const useLoginContext = () => {
    const context = useContext(LoginContext);

    if (!context) throw new Error("useLoginContext must be used within LoginContextProvider");

    return context;
}

export interface LoginProviderProps {
    children: ReactNode;
}

export const LoginProvider: FC<LoginProviderProps> = ({children}) => {

    const [openDialog, setOpenDialog] = useState<DialogType | null>(null);
    const [rememberMe, setRememberMe] = useState<boolean>(false);

    const contextValues: LoginContextValues = {
        openDialog,
        onOpenDialog: (dialog: DialogType) => setOpenDialog(dialog),
        onCloseDialog: () => setOpenDialog(null),
        rememberMe,
        setRememberMe,
    }

    return (
        <LoginContext.Provider value={contextValues}>
            {children}
        </LoginContext.Provider>
    )
}