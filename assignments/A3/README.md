# Visualisation and Visual Data Analysis

## A2: D3 assignment --- part 3

### Student details

- Name: Peter Ferenc Gyarmati
- Matriculation number: 11913446

### Starting the App

Install the dependencies and start the development server

```shell
npm i && npm run dev
```

The final version of the app was produced by the following command:

```shell
npm run build && npm run export
```

### Design Decisions

#### Used Framework

I used NextJS with React for this assignment, since it comes with various optimizations and out-of-the-box features,
such as automatic code-splitting, TypeScript & TailwindCSS support.

I used the React Context API for state management across the components.

#### Used Color Schemes

I added support for multiple color schemes, taken from
a [Bivariate Choropleth example](https://observablehq.com/@d3/bivariate-choropleth). I chose the Red-Blue variant, to be
used as the default scheme, as I found it to have the best contrast, making the quantiles clearly separated.

#### File Reading

Instead of reading CSV files directly, I squeezed the source CSV files' contents into JSON files as a single string for
easier parsing.
