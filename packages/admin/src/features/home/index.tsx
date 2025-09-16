import { Stack } from "@mui/material";

import Logo from "../../components/ui/Logo";

const Home = () => {
  return (
    <Stack
      height="100%"
      direction="column"
      justifyContent="center"
      alignItems="center"
      gap={3}
    >
      <Logo sx={{ width: 250, aspectRatio: "1/1", opacity: 0.5, userSelect: 'none' }} />
    </Stack>
  );
};

export default Home;
