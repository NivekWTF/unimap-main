import { Card, CardMedia, Skeleton, CardContent, Stack } from '@mui/material';

const SkeletonCards = () => {
  return [1, 2, 3, 4].map((key) => (
    <Card key={key} variant="outlined">
      <CardMedia component="div">
        <Skeleton height={240} width="110%" sx={{ translate: '0px -60px' }} />
      </CardMedia>
      <CardContent sx={{ translate: '0px -130px', height: 20 }}>
        <Stack pt={3} gap={1}>
          <Skeleton height={20} />
          <Skeleton height={20} />
          <Skeleton height={20} />
        </Stack>
      </CardContent>
    </Card>
  ));
};

export default SkeletonCards;
