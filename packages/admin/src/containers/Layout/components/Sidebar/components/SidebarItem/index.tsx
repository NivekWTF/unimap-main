import { FC } from "react";

import { Link } from "react-router-dom";
import {
  ListItemButton,
  Stack,
  SxProps,
  Typography,
} from "@mui/material";

import Icon from "@mui/material/Icon";

import { MenuItem } from "../../../../../../constant/menu";

type SidebarItemProps = {
  item: MenuItem;
  active?: boolean;
};

const activeStyle: SxProps = {
  color: "primary.400",
  backgroundColor: "primary.200",
};

const SidebarItem: FC<SidebarItemProps> = ({ item, active }) => {
  const { name, path, icon } = item;

  return (
    <ListItemButton sx={{
      padding: 0,
      borderRadius: 4,
      marginBottom: 1,
      ...(active ? activeStyle : {}),
    }}>
      {active ? (
        <Stack direction="row" gap={2} px={2} py={1.5} alignItems="center">
          <Icon>{icon}</Icon>
          <Typography whiteSpace="nowrap" variant="caption" fontWeight={600}>{name}</Typography>
        </Stack>
      ) : (
        <Link style={{ width: "100%" }} to={path}>
          <Stack direction="row" gap={2} px={2} py={1.5} alignItems="center">
            <Icon>{icon}</Icon>
            <Typography whiteSpace="nowrap" variant="caption" fontWeight={600}>{name}</Typography>
          </Stack>
        </Link>
      )}
    </ListItemButton>
  );
};

export default SidebarItem;
