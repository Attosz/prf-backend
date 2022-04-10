const router = require('express').Router()
const mongoose = require('mongoose')

const productModel = mongoose.model('product')
const orderModel = mongoose.model('order')
const userModel = mongoose.model('user')

const passport = require('passport')

// --- Products ---

router.route('/products/:id?').get((req, res) => {
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
    if (!req.params.id || !req.body.price || !req.body.itemcount) {
        return res.status(400).send("Error: Requiered: name, price, itemcount")
    } else {
        priceModel.findOne({ name: req.params.id }, (err, product) => {
            if (err) return res.status(500).send('DB error ' + err)
            if (product) return res.status(400).send('Product already defined under this name.')
            const newProduct = new priceModel({
                name: req.params.id,
                darab: req.body.darab,
                ar: req.body.ar
            })
            newProduct.save((error) => {
                if (error) return res.status(500).send('DB error during saving product ' + error)
                return res.status(200).send(req.body)
            })
        })
    }
}).put((req, res) => {
    if (!req.params.id || (!req.body.price && !req.body.itemcount)) {
        return res.status(400).send("Error: Requiered: name, and eiter price, itemcount)")
    } else {
        productModel.findOne({ nev: req.params.id }, (err, aru) => {
            if (err) return res.status(500).send('DB error ' + err)
            if (!product) return res.status(400).send('Product not found by name')
            if (req.body.price) product.price = req.body.price
            if (req.body.itemcount) aru.itemcount = req.body.itemcount
            product.save((error) => {
                if (error) return res.status(500).send('DB error during saving product ' + error)
                return res.status(200).send(aru)
            })
        })
    }
}).delete((req, res) => {
    if (!req.params.id) {
        productModel.deleteMany((err) => {
            if (err) return res.status(500).send('DB error ' + err)
            return res.status(200).send('DELETED EVERYTHING')
        })
    } else {
            productModel.deleteOne({ name: req.params.id }, (err) => {
            if (err) return res.status(500).send('DB error ' + err)
            return res.status(200).send('Prodcut is no more.')
        })
    }
})

// --- Users ---

router.route('/users/:id?').get((req, res) => {
    if (!req.params.id) {
        userModel.find((err, users) => {
            if (err) return res.status(500).send('DB error: ' + err)
            return res.status(200).send(users)
        })
    } else {
        userModel.findOne({ nev: req.params.id }, (err, user) => {
            if (err) return res.status(500).send('DB error: ' + err)
            if (!user) return res.status(400).send('No user found by name!')
            return res.status(200).send(user)
        })
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
    if (!req.params.id || (!req.body.password && !req.body.email)) {
        return res.status(400).send("Hiányos input!")
    } else {
        userModel.findOne({ username: req.params.id }, (err, user) => {
            if (err) return res.status(500).send('DB error: ' + err)
            if (!user) return res.status(400).send('User was not created before!')
            if (req.body.password) user.password = req.body.password
            if (req.body.email) user.email = req.body.email
            user.save((error) => {
                if (error) return res.status(500).send('DB error during saving: ' + error)
                return res.status(200).send(user)
            })
        })
    }
}).delete((req, res) => {
    if (req.params.id) {
        userModel.deleteOne({ username: req.params.id }, (err) => {
            if (err) return res.status(500).send('DB error ' + err)
            return res.status(200).send('User deleted from database')
        })
    } else {
        return res.status(403).send('Do not even try to delete all users!')
    }
})

// --- Orders ---
//TODO: implement properly
router.route('/orders/:id?').get((req, res) => {
    if (req.user == null) {
        
    } else {
        orderModel.find({username: req.user.username}, (err, orders) => {
            if (err) return res.status(500).send('DB error ' + err)
            if (!orders) return res.status(400).send('No order was found under this user.')
            return res.status(200).send(orders)
        })
    }
}).post((req, res) => {
    if (!req.params.id || !req.body.price || !req.body.itemcount) {
        return res.status(400).send("Error: Requiered: name, price, itemcount")
    } else {
        orderModel.findOne({ name: req.params.id }, (err, product) => {
            if (err) return res.status(500).send('DB error ' + err)
            if (product) return res.status(400).send('Product already defined under this name.')
            const newOrder = new priceModel({
                name: req.params.id,
                darab: req.body.darab,
                ar: req.body.ar
            })
            newOrder.save((error) => {
                if (error) return res.status(500).send('DB error during saving product ' + error)
                return res.status(200).send(req.body)
            })
        })
    }
}).put((req, res) => {
    if (!req.params.id || (!req.body.price && !req.body.itemcount)) {
        return res.status(400).send("Error: Requiered: name, and eiter price, itemcount)")
    } else {
        productModel.findOne({ nev: req.params.id }, (err, aru) => {
            if (err) return res.status(500).send('DB error ' + err)
            if (!product) return res.status(400).send('Product not found by name')
            if (req.body.price) product.price = req.body.price
            if (req.body.itemcount) aru.itemcount = req.body.itemcount
            product.save((error) => {
                if (error) return res.status(500).send('DB error during saving product ' + error)
                return res.status(200).send(aru)
            })
        })
    }
}).delete((req, res) => {
    if (req.params.id) {
        orderModel.deleteOne({ username: req.params.id }, (err) => {
            if (err) return res.status(500).send('DB error ' + err)
            return res.status(200).send('User deleted from database')
        })
    } else {
        return res.status(403).send('Do not delete all orders')
    }
})

// --- LOGIN ---

router.route('/login').post((req, res, next) => {
    if (req.body.username, req.body.password) {
        //meghívom a passport local stratégiáját és paraméterként átadom neki a req,res objektumokat
        passport.authenticate('local', function (error, user) {
            console.log('login eredménye:',user)
            if (error) return res.status(500).send(error);
            // ezzel léptetem bele a sessionbe a felhasználót, a user objektumot utána mindig el tudom majd érni
            // req.user néven
            req.logIn(user, function (error) {
                if (error) return res.status(500).send(error);
                return res.status(200).send('Bejelentkezes sikeres');
            })
        })(req, res);
    } else { return res.status(400).send('Hibas keres, username es password kell'); }
});

// --- LOGOUT ---

router.route('/logout').post((req, res, next) => {
    console.log('user:', req.user)
    // ha volt sikeres login és sikerült sessionbe léptetni a usert, akkor a session megszüntetéséig
    // vagyis logoutig ez az isAuthenticated() mindig true lesz majd
    if (req.isAuthenticated()) {
        req.logout(); // megszünteti a sessiont
        return res.status(200).send('Kijelentkezes sikeres');
    } else {
        return res.status(403).send('Nem is volt bejelentkezve');
    }
})

module.exports = router