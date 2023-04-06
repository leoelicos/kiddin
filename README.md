# Kiddin'

![express](https://img.shields.io/badge/4.18.1-0?label=Express&style=for-the-badge&labelColor=white&color=black) ![express-handlebars](https://img.shields.io/badge/6.0.6-0?label=express-handlebars&style=for-the-badge&labelColor=white&color=black) ![express-session](https://img.shields.io/badge/1.17.3-0?label=express-session&style=for-the-badge&labelColor=white&color=black) ![multer](https://img.shields.io/badge/1.4.4-0?label=multer&style=for-the-badge&labelColor=white&color=black)

![sequelize](https://img.shields.io/badge/6.20.1-0?label=Sequelize&style=for-the-badge&labelColor=white&color=black) ![connect-session-sequelize](https://img.shields.io/badge/7.1.3-0?label=connect-session-sequelize&style=for-the-badge&labelColor=white&color=black)

![bcrypt](https://img.shields.io/badge/5.0.1-0?label=bcrypt&style=for-the-badge&labelColor=white&color=black) ![mysql2](https://img.shields.io/badge/2.3.3-0?label=mysql2&style=for-the-badge&labelColor=white&color=black) ![dotenv](https://img.shields.io/badge/16.0.1-0?label=dotenv&style=for-the-badge&labelColor=white&color=black)

---

## Description

Kiddin' is a full stack application that allows logged-in contributors to view Threads and Posts and create Posts. Each Post consist of a photo, a title and a short text area. In our Marketplace Thread, there is an additional option to list a price, which potential buyers can see.

This application uses npm packages `express`, `express-handlebars`, `express-session`, `sequelize`, `connection-session-sequelize`, `bcrypt`, `mysql2` and `dotenv`.

Our application also uses an npm package called `multer`, which allows users to upload photos. As defined in [Issues](https://github.com/leoelicos/kiddin/issues), our future direction includes having a Profile.handlebar for a user's posts and other statistics, and an API route to create and remove Threads.

We made this application to learn about full-stack applications created with Model-View-Controller, and we used GitHub Projects and various Pull Requests to create this app: https://github.com/leoelicos/kiddin/projects/1

## Table of Contents

-  [Usage](#usage)
-  [Screenshots](#screenshots)
-  [Installation for API testing in Insomnia](#installation-for-api-testing-in-insomnia)
-  [Credits](#credits)
-  [License](#license)

## Usage

Visit [Kiddin](https://kiddin.herokuapp.com/) on a browser on a computer or mobile.

| Step               | Details                                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| `View all threads` | Go to [Kiddin](https://kiddin.herokuapp.com/) or click on Homepage in any page |
| `View a thread`    | `Login`, then click on one of the three threads on the homepage                                      |
| `Login`            | Enter your username, email and password                                                              |
| `Sign up`          | Enter a username, email and a password. Password min. 8 characters                                   |

## Installation for API testing in Insomnia

### 0. Required

| Programs   | Download links                             |
| ---------- | ------------------------------------------ |
| `Node`     | https://nodejs.org/en/download/            |
| `Mysql`    | https://dev.mysql.com/downloads/installer/ |
| `Insomnia` | https://insomnia.rest/download             |

### 1. Git clone and go inside

```sh
git clone https://github.com/leoelicos/kiddin.git

cd kiddin
```

### 2. Rename `.env.EXAMPLE` to `.env`

```sh
mv .env.Example .env
```

Input your Mysql credentials. _Don't forget to save!_

-  `DB_USER={username}`
-  `DB_PASSWORD={password}`

### 3. Go inside `db`, invoke `Mysql`, enter {password}, run `schema`

```sh
cd db

mysql -u root -p

{password}

source schema.sql;

exit
```

### 4. Return to root, install dependencies, (optionally) run seed

```sh
cd ..

npm install

npm run seed

```

### 5. Start the server, then access the API with Insomnia

```sh
npm start
```

---

## Credits

-  BCS Resources
-  [Normalize.css](https://necolas.github.io)

## License

Licensed under the [MIT License](./LICENSE).
