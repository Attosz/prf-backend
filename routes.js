const router = require('express').Router()
const mongoose = require('mongoose')

const productModel = mongoose.model('product')
const orderModel = mongoose.model('order')
const userModel = mongoose.model('user')

const passport = require('passport')

// --- Products ---

router.route('/products/:id?').get((req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(403).send("Login requiered");
    }
    if (!req.params.id) {
        productModel.find((err, products) => {
            if (err) return res.status(500).send('DB error ' + err)
            return res.status(200).send(products)
        })
    } else {
        productModel.findOne({ name: req.params.id }, (err, product) => {
            if (err) return res.status(500).send('DB error ' + err)
            if (!product) return res.status(400).send('No product found by this name.')
            return res.status(200).send(product)
        })
    }
}).post((req, res) => {
    if (!req.isAuthenticated() || req.user.accessLevel != "admin")
        return res.status(403).send("Only admin can add products")
    if (!req.params.id || !req.body.price || !req.body.itemcount) {
        return res.status(400).send("Error: Requiered: name, price, itemcount")
    } else {
        productModel.findOne({ name: req.params.id }, (err, product) => {
            if (err) return res.status(500).send('DB error ' + err)
            if (product) return res.status(400).send('Product already defined under this name.')
            if (req.body.price <= 0) return res.status(400).send('Price count must be more than 0')
            if (req.body.itemcount <= 0) return res.status(400).send('Item count must be more than 0')
            const newProduct = new productModel({
                name: req.params.id,
                itemcount: req.body.itemcount,
                price: req.body.price
            })
            newProduct.save((error) => {
                if (error) return res.status(500).send('DB error during saving product ' + error)
                return res.status(200).send(req.body)
            })
        })
    }
}).put((req, res) => {
    if (!req.isAuthenticated() || req.user.accessLevel != "admin")
        return res.status(403).send("Only admin can alter products")
    if (!req.params.id || (!req.body.price && !req.body.itemcount)) {
        return res.status(400).send("Error: Requiered: name, and eiter price, itemcount)")
    } else {
        productModel.findOne({ name: req.params.id }, (err, product) => {
            if (err) return res.status(500).send('DB error ' + err)
            if (!product) return res.status(400).send('Product not found by name')
            if (req.body.price) product.price = req.body.price
            if (req.body.itemcount) product.itemcount = req.body.itemcount
            product.save((error) => {
                if (error) return res.status(500).send('DB error during saving product ' + error)
                else return res.status(200).send(product)
            })
        })
    }
}).delete((req, res) => {
    if (!req.isAuthenticated() || req.user.accessLevel != "admin")
        return res.status(403).send("Only admin can delete products")
    if (!req.params.id) {
        return res.status(403).send('Cannot delet everything...')
    } else {
            productModel.deleteOne({ name: req.params.id }, (err) => {
            if (err) return res.status(500).send('DB error ' + err)
            return res.status(200).send('Prodcut is no more.')
        })
    }
})

// --- Users ---

router.route('/users/:id?').get((req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(403).send("Login requiered");
    }
    if (!req.params.id) {
        userModel.findOne({ username: req.user.username }, (err, user) => {
            if (err) return res.status(500).send('DB error: ' + err)
            if (!user) return res.status(400).send('Information not found!')
            return res.status(200).send(user)
        })
    } else {
        if (req.user.accessLevel == 'admin') {
            userModel.findOne({ username: req.params.id }, (err, user) => {
                if (err) return res.status(500).send('DB error: ' + err)
                if (!user) return res.status(400).send('No user found by name!')
                return res.status(200).send(user)
            })
        } else {
            return res.status(401).send("Can't view other users profile")
        }
    }
}).post((req, res) => {
    if (!req.params.id || !req.body.password || !req.body.email) {
        return res.status(400).send("Error: Requiered: username, password, email!")
    } else {
        userModel.findOne({ username: req.params.id }, (err, user) => {
            if (err) return res.status(500).send('DB error: ' + err)
            if (user) return res.status(400).send('Username already taken.')
            const newUser = new userModel({
                username: req.params.id,
                email: req.body.email,
                password: req.body.password
            })
            newUser.save((error) => {
                if (error) return res.status(500).send('DB error during saving: ' + error)
                return res.status(200).send(req.body)
            })
        })
    }
}).put((req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(403).send("Login requiered");
    }
    if (!req.params.id || (!req.body.password && !req.body.email && !req.body.wallet && !req.body.accessLevel)) {
        return res.status(400).send("Hiányos input!")
    } else {
        userModel.findOne({ username: req.params.id }, (err, user) => {
            if (err) return res.status(500).send('DB error: ' + err)
            if (!user) return res.status(400).send('User was not created before!')
            if (req.body.password) user.password = req.body.password
            if (req.body.email) user.email = req.body.email
            if (req.body.wallet) user.wallet = req.body.wallet
            if (req.body.accessLevel && req.user.accessLevel == "admin")
                user.accessLevel = req.body.accessLevel
            user.save((error) => {
                if (error) return res.status(500).send('DB error during saving: ' + error)
                return res.status(200).send(user)
            })
        })
    }
}).delete((req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(403).send("Login requiered");
    }
    if (req.user.accessLevel != "admin") {
        return res.status(403).send("Forbidden");
    }
    if (req.params.id) {
        userModel.deleteOne({ username: req.params.id }, (err) => {
            if (err) return res.status(500).send('DB error ' + err)
            return res.status(200).send('User deleted from database')
        })
    } else {
        return res.status(403).send('Do not even try to delete all users!')
    }
})

router.route('/allusers').get((req, res) => {
    if (!req.isAuthenticated() || req.user.accessLevel != "admin") {
        return res.status(403).send("Only admin territories!");
    } else {
        userModel.find((err, users) => {
            if (err) return res.status(500).send('DB error: ' + err)
            return res.status(200).send(users)
        })
    }
})

// --- Orders ---

router.route('/orders/:id?').get((req, res) => { 
    if (!req.isAuthenticated()) {
        return res.status(403).send("Login requiered");
    }
    if (!req.params.id) {
        if (req.user.accessLevel == 'admin') {
            orderModel.find((err, orders) => {
                if (err) return res.status(500).send('DB error ' + err)
                if (!orders) return res.status(400).send('No order was found.')
                return res.status(200).send(orders)
            })
        } else {
            orderModel.find({username: req.user.username}, (err, orders) => {
                if (err) return res.status(500).send('DB error ' + err)
                if (!orders) return res.status(400).send('No order was found under this user.')
                return res.status(200).send(orders)
            })
        }
    } else {
        const tmpId = mongoose.Types.ObjectId(req.params.id);
        orderModel.findById(tmpId, (err, order) => {
            if (err) return res.status(500).send('DB error: ' + err)
            if (!order) return res.status(400).send('Order was not found.')
            if (req.user.username != order.username && req.user.accessLevel != 'admin') {
                return res.status(403).send('You have no permission to view this order.')
            }
            return res.status(200).send(order)
        })
    }

}).post((req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(403).send("Login requiered");
    }
    if (!req.body.productname || !req.body.itemcount) {
        return res.status(400).send('No Product name, itemcount was not defined for order.')
    }
    //Get product itemcount
    productModel.findOne({name: req.body.productname}, (err, product) => {
        if (err)
            return res.status(500).send('DB error ' + err)
        if (!product)
            return res.status(400).send('Product not found!')
        if (product.itemcount < req.body.itemcount)
            return res.status(400).send('Not enough product available at the moment.')
        if (req.body.itemcount < 1)
            return res.status(400).send('Have to order at least 1')

        //Find user and get presen wallet
        userModel.findOne({username: req.user.username}, (err, user) => {
            if (err) return res.status(500).send('DB error ' + err)
            if (!user) return res.status(400).send('User not found')
            if (user.wallet < product.price * req.body.itemcount) {
                return res.status(400).send('Not enough currency at your wallet for order')
            }

            //Make order
            const newOrder = new orderModel({
                username: req.user.username,
                productname: req.body.productname,
                itemcount: req.body.itemcount,
                status: "Order submitted",
                iscompleated: false
            })
            newOrder.save((error) => {
                if (error) return res.status(500).send('DB error during saving product ' + error)
            })

            //Save product itemcount update
            product.itemcount -= req.body.itemcount
            product.save((error) => {
                if (error) return res.status(500).send('DB error during updating product count ' + error)
            })

            //Save user wallet update
            user.wallet -= product.price * req.body.itemcount
            user.save((error) => {
                if (error) return res.status(500).send('DB error during updating user wallet ' + error)
            })

            //Succes
            return res.status(200).send(newOrder)
        })
    })
}).put((req, res) => {
    if (!req.isAuthenticated())
        return res.status(403).send("Login requiered")
    if (req.user.accessLevel != "admin")
        return res.status(403).send('You should not be here!')
    if (!req.params.id) {
        return res.status(400).send('For updating order ID is a must.') 
    }
    orderModel.findById(mongoose.Types.ObjectId(req.params.id), (err, order) => {
        if (err) return res.status(500).send('DB error: ' + err) 
        if (!order) return res.status(400).send('Order not found!')
        if (!req.body.status) return res.status(400).send('Status needs to be defined')
        order.status = req.body.status
        if (req.body.status == 'Done') order.iscompleated = true;
        order.save((error) => {
            if (error) return res.status(500).send('DB error during saving: ' + error)
            return res.status(200).send(order)
        })
    })
}).delete((req, res) => {
    if (!req.isAuthenticated())
        return res.status(403).send("Login requiered");
    if (req.user.accessLevel != "admin")
        return res.status(403).send('You should not be here!')
    if (!req.params.id)
        return res.status(404).send('Do not delete all orders...')

    orderModel.findById(req.params.id, (err, order) => {
        if (err) return res.status(500).send('DB error: ' + err) 
        else if (!order) return res.status(400).send('Order not found!')
        else {
            order.delete((error) => {
                if (error) return res.status(500).send('DB error during saving: ' + error)
            })
            if (order.iscompleated) {
                return res.status(200).send("Deletion compleated!")
            } else {
                productModel.findOne({name: order.productname}, (err, product) => {
                    if (err)
                        return res.status(500).send('DB error ' + err)
                    if (!product)
                        return res.status(400).send('Product not found!')
                    product.itemcount += order.itemcount
                    product.save((error) => {
                        if (error) return res.status(500).send('DB error during updating product count ' + error)
                    })
                })
                return res.status(200).send("Deletion compleated!")
            }
        }
    })
})

// --- LOGIN ---

router.route('/login').post((req, res, next) => {
    if (req.body.username, req.body.password) {
        passport.authenticate('local', { failureRedirect: '/login' }, function (error, user) {
            if (error) return res.status(500).send(error);
            req.logIn(user, function (error) {
                if (error) return res.status(500).send(error);
                return res.status(200).send('Bejelentkezes sikeres');
            })
        })(req, res);
    } else { return res.status(400).send('Hibas keres, username es password kell'); }
});

// --- LOGOUT ---

router.route('/logout').post((req, res, next) => {
    if (req.isAuthenticated()) {
        req.logOut(); // megszünteti a sessiont
        return res.status(200).send('Kijelentkezes sikeres');
    } else {
        return res.status(403).send('Nem is volt bejelentkezve');
    }
})

module.exports = router