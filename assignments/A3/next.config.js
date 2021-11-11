const isProduction = process.env.NODE_ENV === 'production';
const hostUrl = 'http://wwwlab.cs.univie.ac.at';
const basePath = '/~gyarmatip41/app-store-clone-app';

/** @type {import('next').NextConfig} */
module.exports = {
    swcMinify: true,
    reactStrictMode: true,
    assetPrefix: isProduction ? `${hostUrl}${basePath}` : '',
    basePath: isProduction ? basePath : ''
};
