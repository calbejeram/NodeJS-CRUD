const mySql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = mySql.createConnection(
    {
        database: process.env.DATABASE,
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        port: process.env.DATABASE_PORT
    }
);

// Register Function
exports.register = (request, response) => {
    const { firstName, lastName, email, password, confirmPassword } = request.body;

    db.query(
        "SELECT email FROM accounts WHERE email = ?",
        email,
        async(error, result) => {
            console.log(result)
            if (error) {
                console.log(error);
            }

            if (result.length > 0) {
                response.render('register',{
                    errorMsg: 'Email is already registered',
                    color: 'alert-danger'
                })
            } else if (confirmPassword !== password) {
                response.render('register', {
                    errorMsg: 'Password does not match',
                    color: 'alert-danger'
                })
            }

            const hashPassword = await bcrypt.hash(password, 8);
            console.log(hashPassword);

            db.query(
                "INSERT INTO accounts SET ?",
                {
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    password: hashPassword
                },
                (error, results) => {
                    if (error) {
                        console.log(error)
                    } else {
                        console.log(results)
                        response.render("register", {
                            message: "You are now registered"
                        })
                    };
                }
            );
        }
    )
};


// Login Function
exports.login = (request, response) => {
    try {
        const { email, password } = request.body;

    if (email === "" || password === "") {
        response.render("index",
            {
                errorMsg: "Email and Password should not be empty"
            }
        )
    } else {
        db.query (
            "SELECT email, password FROM accounts WHERE email = ?",
            email,
            async(error, result) => {
                if (!result.length > 0) {
                    response.render("index",
                    {
                        errorMsg: "The email does not exist!"
                    })
                } else if (!(await bcrypt.compare(password, result[0].password))) {
                    response.render("index", 
                    {
                        errorMsg: "Password is incorrect!"
                    })
                } else {
                    
                    const account_id = result[0].account_id;
                    const token = jwt.sign({account_id}, process.env.JWT_SECRET,{
                        expiresIn: process.env.JWT_EXPIRES
                    });
                    // const decoded = jwt.decode(token,
                    //     {comple: true});
                    // console.log(decoded);
                    const cookieOptions = {
                        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
                        httpOnly: true
                    }
                    response.cookie("JWT" + token, cookieOptions);

                    // console.log(token);
                    // console.log(cookieOptions);

                    db.query(
                        "SELECT * FROM accounts",
                        (error, result) => {
                            console.log(result)
                            response.render("listaccounts",
                                {
                                    title: "List of Users",
                                    accounts: result
                                })
                        }
                    )
                    
                }
            }


        )
    }
    } catch (err) {
        console.log(err);
    }
};

// Population Update Function

exports.updateform = (request, response) => {
    const email = request.params.email;
    db.query(
        "SELECT * FROM accounts WHERE email = ?",
        email,
        (error, result) => {
            console.log(result);
            response.render('updateform',
            {
                result: result[0]
            });
        }
    );
};

// Modifying Update Function

exports.updateuser = (request, response) => {
    const { firstName, lastName, email} = request.body;

    if (firstName === "" || lastName === "" ) {
        response.render('updateform', {
            errorMsg: "First Name and Last Name should not be empty",
            result: {
                firstName: firstName,
                lastName: lastName,
                email: email
            }
        })
    } else {
        db.query (
            `UPDATE accounts SET first_name = "${firstName}", last_name = "${lastName}" WHERE email = "${email}"`,
            {firstName, lastName},
            (error, result) => {
                if (error) {
                    console.log(error);
                } else {
                    db.query (
                        "SELECT * FROM accounts",
                        (error, result) => {
                            response.render("listaccounts", {
                                title: "List of Users",
                                accounts: result
                            })
                        }
                    )
                }
            }
        )
    }
};

// Delete an account from the database

exports.deleteaccount = (request, response) => {
    const account_id = request.params.account_id;

    db.query(
        "DELETE FROM accounts WHERE account_id = ?",
        account_id,
        (error, result) => {
            if (error) {
                console.log(error);
            }
            db.query(
                "SELECT * FROM accounts",
                (error, result) => {
                    response.render("listaccounts",
                    {
                        title: "Updated List of Users",
                        accounts: result
                    })
                }
            )
        }
    )
}

// See Skillsets from Database
exports.skillsets = (request, response) => {
    const account_id= request.params.account_id;

    db.query(
        "SELECT * FROM skillsets WHERE account_id = ?",
        account_id,
        (error, result) => {
            console.log(result);
            response.render('skillsets',
            {
                title: "Skillsets",
                skillset: result
            });
        }
    );
}

// Logout session
exports.logout = (request, response) => {
    // if (request.session) {
    //     request.session.destroy((error) => {
    //         if (error) {
    //             response.status(400).send("Unable to logout");
    //         } else {
    //             response.clear.cookie("JWT").status(200).json({
    //                 message: "Successfully Logged Out"
    //             })
    //             response.reder("index");
    //         }
    //     })
    // } else {
    //     console.log("no session");
    //     response.end();
    // }
    response.clearCookie("JWT").status(200);
    response.render("index", {
        message: "Logged out successfully"
    });
}