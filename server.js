const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const { loadContact, findContact, addContact, cekDuplikat, deleteContact, updateContacts } = require ('./utility/contacts')
const { body, validationResult, check } = require('express-validator')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')
const app = express()
const port = 3000


app.set('view engine', 'ejs')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))

// konfigurasi flash
app.use(cookieParser('secret'))
app.use(session( {
    cookie: { maxAge: 6000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    })
)
app.use(flash())

app.get('/index', (req, res) => {
    res.status(200)
    const mahasiswa = [
        {
            nama : 'Kireina',
            email: 'kireinaar1618@gmail.com'
        },


        {
            nama : 'Naya',
            email: 'naya10@gmail.com'
        }
    ];


    res.render('index', {
        nama : 'Kireina Amani',
        title: 'Halaman Index',
        mahasiswa : mahasiswa,
        layout: 'layouts/main-layout',
        title: 'Halaman Home'
        
    })
    // res.sendFile('./index.html',{root: __dirname})
})

app.get('/about', (req, res) => {
    
    res.status(200)
    res.render('about', {
        layout: 'layouts/main-layout',
        title: 'Halaman About'
    })
    // res.sendFile('./about.html',{root: __dirname})
})


app.get('/contact', (req, res) => {
    const contacts = loadContact()

    res.status(200)
    res.render('contact', {
        layout: 'layouts/main-layout',
        title: 'Halaman Contact',
        contacts,
        msg: req.flash('msg')
    })
    // res.sendFile('./contact.html',{root: __dirname})
})

// halaman form tambah data contact
app.get('/contact/add', (req, res) => {
    res.render('add-contact', {
        title: 'Form Tambah Data Contact',
        layout: 'layouts/main-layout'
    })
})

// proses data contact
app.post('/contact', [
    body('nama').custom((value) => {
        const duplikat = cekDuplikat(value)
        if (duplikat) {
            throw new Error('Nama contact sudah digunakan')
        }
        return true
    }),
    check('email', 'Email tidak valid!').isEmail(), 
    check('nomor', 'Nomor HP tidak valid' ).isMobilePhone('id-ID')
    ], 
    (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.render('add-contact', {
        title: 'Form Tambah Data Contact',
        layout: 'layouts/main-layout',
        errors: errors.array(),
        })
    } else {
        addContact(req.body)
        // kirim flash message
        req.flash('msg', 'Data contact berhasil ditambahkan')
        res.redirect('/contact')
    }
})

// proses delete contact
app.get('/contact/delete/:nama', (req, res) => {
    const contact = findContact(req.params.nama)

    // jika contact tidak ada
    if (!contact) {
        res.status(404)
        res.send('<h1>404</h1>')
    } else {
        deleteContact(req.params.nama)
        req.flash('msg', 'Data contact berhasil dihapus')
        res.redirect('/contact')
    }
})

// form edit data contact
app.get('/contact/edit/:nama', (req, res) => {
    const contact = findContact(req.params.nama)
    res.render('edit-contact', {
        title: 'Form Tambah Edit Data Contact',
        layout: 'layouts/main-layout',
        contact
    })
})

// proses edit data
app.post('/contact/update', [
    body('nama').custom((value, { req }) => {
        const duplikat = cekDuplikat(value)
        if (value !== req.body.oldNama && duplikat) {
            throw new Error('Nama contact sudah digunakan')
        }
        return true
    }),
    check('email', 'Email tidak valid!').isEmail(), 
    check('nomor', 'Nomor HP tidak valid' ).isMobilePhone('id-ID')
    ], 
    (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.render('edit-contact', {
        title: 'Form Edit Data Contact',
        layout: 'layouts/main-layout',
        errors: errors.array(),
        contact: req.body
        })
    } else {
        updateContacts(req.body)
        // kirim flash message
        req.flash('msg', 'Data contact berhasil diubah')
        res.redirect('/contact')
    }
})


// halaman detail contact
app.get('/contact/:nama', (req, res) => {
    const contact = findContact(req.params.nama)

    res.status(200)
    res.render('detail', {
        layout: 'layouts/main-layout',
        title: 'Halaman Detail Contact',
        contact
    })
    // res.sendFile('./contact.html',{root: __dirname})
})

app.use('/', (req, res) => {
    res.status(404)
    res.send('<h1>Halaman tidak ditemukan!</h1>')
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
