import { Link } from "react-router-dom";

import { ROUTES } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

interface LoginPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LoginPromptDialog = ({ open, onOpenChange }: LoginPromptDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Vui lòng đăng nhập để tiếp tục</DialogTitle>
        <DialogDescription>
          Bạn cần đăng nhập tài khoản để thêm sản phẩm vào giỏ và thanh toán.
        </DialogDescription>
      </DialogHeader>
      <div className="mt-4 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
          Để sau
        </Button>
        <Button className="flex-1" asChild>
          <Link to={ROUTES.auth.login}>Đăng nhập ngay</Link>
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);
