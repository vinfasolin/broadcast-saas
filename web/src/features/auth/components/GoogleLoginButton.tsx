import GoogleIcon from "@mui/icons-material/Google";
import { Button } from "@mui/material";

type GoogleLoginButtonProps = {
  loading?: boolean;
  onClick: () => Promise<void>;
};

export const GoogleLoginButton = ({ loading = false, onClick }: GoogleLoginButtonProps) => {
  return (
    <Button
      className="my-3"
      variant="outlined"
      fullWidth
      startIcon={<GoogleIcon />}
      disabled={loading}
      onClick={onClick}
    >
      Entrar com Google
    </Button>
  );
};