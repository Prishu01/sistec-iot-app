const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();

const db = new sqlite3.Database("database.db");

db.serialize(() => {

    db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        password TEXT
    )
    `);

    db.run(`
    CREATE TABLE IF NOT EXISTS sensor_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        temperature TEXT,
        humidity TEXT,
        time TEXT,
        date TEXT
    )
    `);

});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());

app.use(session({
    secret: "sistecsecret",
    resave: false,
    saveUninitialized: true
}));

app.use(express.static("public"));

function getIndianTime() {

    const now = new Date();

    const time = now.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit"
    });

    const date = now.toLocaleDateString("en-GB", {
        timeZone: "Asia/Kolkata"
    });

    return { time, date };
}

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views/index.html"));
});

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "views/register.html"));
});

app.get("/dashboard", (req, res) => {

    if (!req.session.user) {
        return res.redirect("/");
    }

    res.sendFile(path.join(__dirname, "views/dashboard.html"));
});

app.post("/register", (req, res) => {

    const { name, email, password } = req.body;

    db.run(
        `INSERT INTO users (name,email,password) VALUES (?,?,?)`,
        [name, email, password],
        function(err) {

            if (err) {
                return res.send("Error");
            }

            res.redirect("/");
        }
    );
});

app.post("/login", (req, res) => {

    const { email, password } = req.body;

    db.get(
        `SELECT * FROM users WHERE email=? AND password=?`,
        [email, password],
        (err, row) => {

            if (row) {

                req.session.user = row;

                res.redirect("/dashboard");

            } else {

                res.send("Invalid Login");

            }
        }
    );
});

app.get("/logout", (req, res) => {

    req.session.destroy();

    res.redirect("/");
});

app.get("/username", (req, res) => {

    if (!req.session.user) {
        return res.json({ name: "" });
    }

    res.json({
        name: req.session.user.name
    });
});

app.post("/save-lcd", (req, res) => {

    const text = req.body.text;

    fs.writeFileSync("lcd.txt", text);

    res.send("Saved");
});

app.get("/lcd", (req, res) => {

    if (!fs.existsSync("lcd.txt")) {
        fs.writeFileSync("lcd.txt", "WELCOME");
    }

    const data = fs.readFileSync("lcd.txt", "utf8");

    res.send(data);
});

app.get("/save-data", (req, res) => {

    const temp = req.query.temp;
    const hum = req.query.hum;

    const india = getIndianTime();

    db.run(
        `
        INSERT INTO sensor_data
        (temperature,humidity,time,date)
        VALUES (?,?,?,?)
        `,
        [temp, hum, india.time, india.date],
        function(err) {

            if (err) {
                return res.send("Error");
            }

            res.send("Data Saved");
        }
    );
});

app.get("/latest", (req, res) => {

    db.get(
        `
        SELECT * FROM sensor_data
        ORDER BY id DESC
        LIMIT 1
        `,
        [],
        (err, row) => {

            res.json(row || {});
        }
    );
});

app.get("/records", (req, res) => {

    db.all(
        `
        SELECT * FROM sensor_data
        ORDER BY id DESC
        `,
        [],
        (err, rows) => {

            res.json(rows);
        }
    );
});

app.get("/delete/:id", (req, res) => {

    db.run(
        `
        DELETE FROM sensor_data
        WHERE id=?
        `,
        [req.params.id],
        function(err) {

            res.redirect("/dashboard");
        }
    );
});

const PORT = process.env.PORT || 3000;

app.get("/api/sensor-data", (req, res) => {

    db.all(
        `
        SELECT * FROM sensor_data
        ORDER BY id ASC
        `,
        [],
        (err, rows) => {

            if (err) {
                return res.json([]);
            }

            res.json(rows);

        }
    );

});

app.listen(PORT, () => {

    console.log("Server Running On Port " + PORT);

});