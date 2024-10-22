import { logoutRequest } from "../api/v1/logout/request";

const LogoutPage = async () => {
  await logoutRequest();
};

export default LogoutPage;
