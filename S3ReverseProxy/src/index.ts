import express, { Request, Response } from "express";
import proxy from "http-proxy";

const app = express();
const proxyServer = proxy.createProxyServer({});
const BUCKET_PATH = `https://deployer-101.s3.ap-south-1.amazonaws.com/__outputs`;

app.use((req: Request, res: Response) => {
  const hostname = req.hostname;
  const projectSubdomain = hostname.split(".")[0];

  const resolvesTo = `${BUCKET_PATH}/${projectSubdomain}`;

  return proxyServer.web(req, res, { target: resolvesTo, changeOrigin: true });
});

proxyServer.on("proxyReq", (proxyReq, req, res) => {
  const url = req.url;
  console.log(`Proxying request to: ${url}`);
  console.log(`path is: ${proxyReq.path}`);
  
  
  if (url == "/") {
    let finalPath =proxyReq.path + "index.html";
    console.log(`finalPath is: ${finalPath}`);
    proxyReq.path = finalPath;
  }
});

app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is running on port ${process.env.PORT || 8000}`);
});
