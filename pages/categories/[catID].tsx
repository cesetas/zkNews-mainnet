import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import { useRouter } from "next/router";

export default function news({ posts }) {
  const { catID } = useRouter().query as any;
  const filteredPost = posts.filter((post: any) => {
    return (
      post.location.toLowerCase() === catID ||
      post.category.toLowerCase() === catID
    );
  });

  return (
    <>
      <Container fixed>
        <Typography color="blue" variant="h3" component="div">
          {catID.toUpperCase()} NEWS
        </Typography>
        <Grid
          container
          spacing={{ xs: 1, sm: 2, md: 4 }}
          columns={{ xs: 1, sm: 1, md: 1, lg: 2, xl: 2 }}
        >
          {filteredPost.map((filteredPost: any) => {
            return (
              <Grid
                item
                xs={1}
                sm={1}
                md={1}
                lg={1}
                xl={1}
                key={filteredPost._id}
              >
                <Link href={`/news/${filteredPost._id}`}>
                  <Card
                    sx={{
                      minWidth: 500,
                      maxWidth: 800,
                      minHeight: 300,
                      maxHeight: 800,
                    }}
                  >
                    <CardMedia
                      component="img"
                      max-height="10px"
                      image={filteredPost.photoURL}
                      alt={filteredPost.location}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        {filteredPost.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {filteredPost.news}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Link href={`/news/${filteredPost._id}`}>
                        <Button size="small">Go to the details...</Button>
                      </Link>
                    </CardActions>
                  </Card>
                </Link>
              </Grid>
            );
          })}
        </Grid>
        <br />

        <Link href="/">
          <Button
            fullWidth
            sx={{
              mb: 3,
              color: "white",
              backgroundColor: "blue",
            }}
            variant="contained"
          >
            Back to Home
          </Button>
        </Link>
      </Container>
    </>
  );
}

news.getInitialProps = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN_LOC}api/posts`);
  const { data } = await res.json();

  return { posts: data as any };
};
