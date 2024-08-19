import app from "./src/app.js";

const PORT = process.env.APP_PORT || 3000

console.log(PORT);
const server = app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
})