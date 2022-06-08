import * as React from "react"
import { graphql } from 'gatsby'
import Grid from '@mui/material/Grid';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { grey } from '@mui/material/colors';

// styles
const pageStyles = {
  color: "#232129",
  padding: 96,
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
}

const IndexPage = ({
 data: {
   countries
 },
}) =>  {
  return (
    <main style={pageStyles}>
        <Grid container rowSpacing={2} columnSpacing={2}>
          { countries.nodes.map((country) =>
              <Grid item xs={6} md={4} key={`grid-country-${country.id}`}>
                <ListItem disablePadding sx={{
                  border: `1px solid ${grey[200]}`,
                  borderRadius: '5px'
                }
                }>
                  <ListItemAvatar style={{display:"flex", justifyContent:"center"}}>
                      <img alt={`flag-${country.name.common}`} width="40px" src={country.flags.svg}/>
                  </ListItemAvatar>
                  <ListItemText primary={country.name.common} secondary={country.region} sx={{
                    backgroundColor: grey[100],
                    margin: 0,
                    padding: '5px 10px'
                  }
                  }/>
                </ListItem>
              </Grid>
          )}
        </Grid>
    </main>
  )
}


export const query = graphql`
  query PageIndex {
    countries: allRestcountriesCountry(limit: 20) {
    nodes {
      id
      region
      name {
        common
        official
      }
      flags {
        svg
      }
    }
  }
}
`

export default IndexPage
