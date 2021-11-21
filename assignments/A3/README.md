# Visualisation and Visual Data Analysis

## A2: D3 assignment --- part 3

### Student details

- Name: Peter Ferenc Gyarmati
- Matriculation number: 11913446

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

## Source Code

This is a [Next.js](https://nextjs.org/) project bootstrapped
with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

### Commands to produce the project

Init the Next App with Typescript

```bash
npx create-next-app --ts
```

Add Tailwind to the project

```bash
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest
npx tailwindcss init -p
```

Add D3

```bash
npm install d3@6.7.0 --save
```

### Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed
on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited
in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated
as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions
are welcome!

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use
the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)
from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
