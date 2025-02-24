const express = require("express");
const db = require("./models");
const http = require("http");
const { initializeSocket } = require("./controller/chat");
const chatRoutes = require("./route/chat");
const user = require("./route/user");
const auth = require("./route/auth");
const community = require("./route/community");
const owner = require("./route/owner");
const comunity = require("./route/comunity");
const goal = require("./route/goal");
const communityType = require("./route/communityType");
const size = require("./route/size");
const visible = require("./route/visible");
const engagementLevel = require("./route/engagementLevel");
const communicationPlatform = require("./route/communicationPlatform");
const connCategory = require("./route/connCategory");
const contentShared = require("./route/contentShared");
const test = require("./route/test");
const blog = require("./route/blog");
const collab = require("./route/collab");
const admin = require("./route/admin");
const currency = require("./route/currency");
const collaborationType = require("./route/collaborationType");
const purchase = require("./route/purchase");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const subPurchase = require("./route/subPurchase");
const review = require("./route/review");

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

const port = process.env.API_PORT;
app.use("/api/subpurchases/webhook", express.raw({ type: "application/json" }));

app.use(morgan("dev"));
app.use(helmet());
app.use(express.json());

app.use(cors({
  origin: '*',  // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'x-reset-token'],
  credentials: false  // Set to false when using origin: '*'
}));


db.sequelize
  .authenticate()
  .then(() => {
    console.log(
      `postgres connection has been established successfully... ${process.env.NODE_ENV}`
    );
  })
  .catch((err) => {
    console.log(`unable to connect to the database ${err.message}`);
    if (
      err.name === "SequelizeConnectionError" ||
      err.name === "SequelizeConnectionRefuseError"
    ) {
      console.log(
        "the databse is disconnected please check the connection and try again"
      );
    } else {
      console.log(
        `An error occured while connecting to the database: ${err.message}`
      );
    }
  });

app.use((req, res, next) => {
  console.log(`incoming request... ${req.method} ${req.path}`);
  next();
});

app.use("/api/auth", auth);
app.use("/api/users", user);
app.use("/api/communities", community);
app.use("/api/owners", owner);
app.use("/api/visible", visible);
app.use("/api/communityTypes", communityType);
app.use("/api/engagementLevels", engagementLevel);
app.use("/api/communicationPlatforms", communicationPlatform);
app.use("/api/collabs", collab);
app.use("/api/goals", goal);
app.use("/api/sizes", size);
app.use("/api/connectioncategories", connCategory);
app.use("/api/contentshared", contentShared);
app.use("/api/test", test);
app.use("/api/posts", blog);
app.use("/api/admin", admin);
app.use("/api/currencies", currency);
app.use("/api/collaborationTypes", collaborationType);
app.use("/api/purchases", purchase);
app.use("/api/subpurchases", subPurchase);
app.use("/api/chat", chatRoutes);
app.use("/api/comunities", comunity);
app.use("/api/reviews", review);

app.use((err, req, res, next) => {
    if (err.type === 'StripeSignatureVerificationError') {
        res.status(400).send(`Webhook Error: ${err.message}`);
    } else {
        next(err);
    }
});

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

if (process.env.NODE_ENV === "development") {
  // PORT = process.env.TEST_PORT;
  drop = { force: true };
}

db.sequelize.sync({ alter: true }).then(() => {
  console.log("All models were synchronized successfully");
  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
});
