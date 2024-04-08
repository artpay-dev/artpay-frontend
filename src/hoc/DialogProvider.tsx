import { Close, CopyAll } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Popover,
  Typography,
  useTheme
} from "@mui/material";
import React, { createContext, ReactNode, useContext, useRef, useState } from "react";
import { FaFacebook, FaWhatsapp } from "react-icons/fa6";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { ButtonProps } from "@mui/material/Button/Button";

export interface DialogOptions {
  showActions?: boolean;
}

export interface OkOnlyDialogOptions {
  txtOk?: string;
  okButtonVariant?: ButtonProps["variant"];
  okButtonColor?: ButtonProps["color"];
}

export interface ShareDialogOptions {
  txtOk?: string;
}

export interface YesNoDialogOptions {
  txtYes?: string;
  txtNo?: string;
  invertColors?: boolean;
}

export interface DialogProvider {
  okOnly(title: string | ReactNode, content: string | ReactNode, options?: OkOnlyDialogOptions): Promise<boolean>;

  share(link: string, title?: string, subtitle?: string, options?: ShareDialogOptions): Promise<boolean>;

  yesNo(title: string | ReactNode, content: string | ReactNode, options?: YesNoDialogOptions): Promise<boolean>;

  custom<T>(
    title: string | ReactNode,
    renderContent: (closeDialog: (value: T) => void) => string | ReactNode,
    options?: DialogOptions
  ): Promise<unknown>;
}

interface DialogState<T> {
  title: string | ReactNode;
  content: string | ReactNode;
  showActions: boolean;
  actions: ReactNode[];
  resolve: (value?: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
  maxWidth?: string;
  padding?: number;
}

export interface DialogProviderProps extends React.PropsWithChildren {
}

const defaultContext: DialogProvider = {
  okOnly: () => Promise.reject("Dialogs not loaded"),
  yesNo: () => Promise.reject("Dialogs not loaded"),
  share: () => Promise.reject("Dialogs not loaded"),
  custom: () => Promise.reject("Dialogs not loaded")
};

const Context = createContext<DialogProvider>({ ...defaultContext });

export const DialogProvider: React.FC<DialogProviderProps> = ({ children }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogState<any>>();

  const handleClose = (value?: unknown) => {
    setOpen(false);
    dialog?.resolve(value);
    setDialog(undefined);
  };
  const resolveDialog = (fn: (value: boolean) => void, value: boolean) => {
    setOpen(false);
    fn(value);
    setDialog(undefined);
  };

  const yesNo: DialogProvider["yesNo"] = (title, content, options = {}) => {
    const { txtYes = "Sì", txtNo = "No", invertColors = false } = options;
    return new Promise((resolve, reject) => {
      setDialog({
        title,
        content,
        resolve,
        reject,
        showActions: true,
        maxWidth: "400px",
        padding: 3,
        actions: [
          <Button
            variant={invertColors ? "outlined" : "contained"}
            color={invertColors ? "success" : "error"}
            autoFocus
            onClick={() => resolveDialog(resolve, true)}>
            {txtYes}
          </Button>,
          <Button
            variant={invertColors ? "contained" : "outlined"}
            color={invertColors ? "error" : "success"}
            autoFocus
            onClick={() => resolveDialog(resolve, false)}>
            {txtNo}
          </Button>
        ]
      });
      setOpen(true);
    });
  };

  const dialogs: DialogProvider = {
    okOnly: (title, content, options = {}) => {
      const { txtOk = "Ok", okButtonVariant = "outlined", okButtonColor } = options;

      return new Promise((resolve, reject) => {
        const handleOk = () => {
          setOpen(false);
          resolve(true);
          setDialog(undefined);
        };

        setDialog({
          title,
          content,
          resolve,
          reject,
          showActions: true,
          padding: 3,
          actions: [
            <Button sx={{ mb: 2 }} autoFocus variant={okButtonVariant} color={okButtonColor}
                    onClick={() => handleOk()}>
              {txtOk}
            </Button>
          ]
        });
        setOpen(true);
      });
    },
    share: (link, title, subtitle, options = {}) => {
      // eslint-disable-next-line no-empty-pattern
      const {} = options;

      const DialogTitle = (
        <Box>
          <Typography variant="h5">{title || "Condividi"}</Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {subtitle || "Condividi la pagina sui social"}
          </Typography>
        </Box>
      );
      const ShareDialogContent = ({}) => {
        const copyButtonRef = useRef<HTMLButtonElement>(null);
        const [copied, setCopied] = useState(false);

        const handleCopy = () => {
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, 3000);
        };

        return (
          <Box display="flex" sx={{ flexDirection: { xs: "column", md: "row" } }} gap={2}>
            <Button href={`https://web.whatsapp.com/send?text=${link}`} target="_blank" startIcon={<FaWhatsapp />}>
              Whatsapp
            </Button>
            <Button href={`https://www.facebook.com/sharer.php?u=${link}`} target="_blank" startIcon={<FaFacebook />}>
              Facebook
            </Button>
            <CopyToClipboard text={link} onCopy={() => handleCopy()}>
              <Button ref={copyButtonRef} startIcon={<CopyAll />}>
                Copia link
              </Button>
            </CopyToClipboard>
            {copyButtonRef?.current && (
              <Popover
                id="copy-link"
                anchorEl={copyButtonRef.current}
                open={copied}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left"
                }}>
                <Typography sx={{ p: 2 }}>Link copiato</Typography>
              </Popover>
            )}
          </Box>
        );
      };
      return new Promise((resolve, reject) => {
        setDialog({
          title: DialogTitle,
          content: <ShareDialogContent />,
          resolve,
          reject,
          showActions: false,
          padding: 3,
          actions: []
        });
        setOpen(true);
      });
    },
    yesNo: yesNo,
    custom: (title, renderContent, options?: DialogOptions) => {
      return new Promise((resolve, reject) => {
        const content = renderContent((value) => {
          setOpen(false);
          resolve(value);
          setDialog(undefined);
        });
        setDialog({
          title,
          content,
          resolve,
          reject,
          showActions: options?.showActions || false,
          actions: [],
          padding: 0
        });
        setOpen(true);
      });
    }
  };

  return (
    <>
      <Context.Provider value={dialogs}>{children}</Context.Provider>
      <Dialog open={open} PaperProps={{ sx: { borderRadius: "16px" } }}>
        <DialogTitle sx={{ m: 0, border: "none", minWidth: { xs: "200px", sm: "400px" } }}>
          <Box display="flex" flexDirection="row" alignItems="flex-start">
            <Box flexGrow={1} mr={1} pl={3} pt={3}>
              {dialog?.title}
            </Box>
            <IconButton
              aria-label="close"
              size="small"
              onClick={() => handleClose()}
              sx={{ color: theme.palette.grey[600] }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ maxWidth: dialog?.maxWidth, p: dialog?.padding, border: "none" }} dividers>
          <div>
            {typeof dialog?.content === "string"
              ? (dialog?.content as string)?.split("\n").map((line, index) => <p key={index}>{line}</p>)
              : dialog?.content}
          </div>
        </DialogContent>
        {dialog?.showActions && (
          <DialogActions sx={{ justifyContent: "space-around" }}>
            {dialog.actions.map((action, index) => (
              <React.Fragment key={index}>{action}</React.Fragment>
            ))}
          </DialogActions>
        )}
      </Dialog>
    </>
  );
};

export const useDialogs = () => useContext(Context);

export default DialogProvider;
