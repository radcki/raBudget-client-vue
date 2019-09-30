declare module 'vue/types/vue' {
  interface Vue {
    $confirm(options: ConfirmOptions): Promise<boolean | any>,
    open(title: string, message: string, options: ConfirmDialogOptions): Promise<boolean | any>
  }
}

export interface ConfirmOptions {
  title: string;
  message: string;
  options: ConfirmDialogOptions
}

export interface ConfirmDialogOptions {
  color?: string | undefined,
  selectList?: any[] | undefined,
  select?: boolean | undefined,
  width?: number | undefined,
  input?: boolean | undefined,
  buttons?: DialogButtons
}

export interface DialogButtons {
  yes: boolean | undefined,
  no: boolean | undefined,
  cancel: boolean | undefined,
  ok: boolean | undefined
}
