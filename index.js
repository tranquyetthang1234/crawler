import app from "./src/app.js";

const PORT = 8000

console.log(PORT);
const server = app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
})