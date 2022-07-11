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
import dateFormat from "dateformat";

export default function news({ posts }) {
  return (
    <>
      <Container fixed>
        <Typography color="blue" variant="h3" component="div">
          NEWS
        </Typography>
        <Grid
          container
          spacing={{ xs: 1, sm: 2, md: 4 }}
          columns={{ xs: 1, sm: 1, md: 2, lg: 3, xl: 3 }}
        >
          {posts.map((post, _id) => {
            return (
              <Grid item xs={1} sm={1} md={1} lg={1} xl={1} key={_id}>
                <Link href={`/news/${post._id}`}>
                  <Card
                    sx={{
                      minWidth: 300,
                      maxWidth: 600,
                      minHeight: 800,
                      maxHeight: 800,
                    }}
                  >
                    <CardMedia
                      component="img"
                      sx={{
                        maxHeight: "250px",
                        minHeight: "200px",
                      }}
                      image={post.photoURL}
                      alt={post.location}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="h5">
                        {post.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {post.news.slice(0, 150)}...
                      </Typography>
                      <br />
                      <div className="flex items-end"></div>
                      {dateFormat(post.createdAt, "mmmm dS, yyyy")}
                    </CardContent>
                    <CardActions>
                      <Link href={`/news/${post._id}`}>
                        <Button size="small">Go into details...</Button>
                      </Link>
                    </CardActions>
                  </Card>
                </Link>
              </Grid>
            );
          })}
        </Grid>
        <br />

        <Link href="/postnews">
          <Button
            fullWidth
            sx={{
              mt: 3,
              mb: 3,
              color: "white",
              backgroundColor: "blue",
            }}
            variant="contained"
          >
            Post news
          </Button>
        </Link>
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

  return { posts: data };
};
