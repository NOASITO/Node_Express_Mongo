const express = require('express')
const router = express.Router()
const Book = require('../models/book.model')

//MIDDLEWARE
const getBook = async (req, res, next) => {
  let book;
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json(
          {
              message: 'El ID del libro no es válido'
          }
      )
  }

  try {
      book = await Book.findById(id);
      if (!book) {
          return res.status(404).json(
              {
                  message: 'El libro no fue encontrado'
              }
          )
      }

  } catch (error) {
      return res.status(500).json(
          {
              message: error.message
          }
      )
  }

  res.book = book;
  next()
}

// Obtener todos los libros [getAll_Books]
const getAll_Books = async (req, res) => {
    try {
        const books = await Book.find();
        console.log('GET ALL', books)
        if (books.length === 0) {
            return res.status(204).json([])
        }
        res.json(books)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}



// Crear un libro [postOne_books]
const postOne_Books = async (req, res) => {
    const { title, author, genre, publication_date } = req?.body
  
  if (!title || !author || !genre || !publication_date) {
      return res.status(400).json({
          message: 'Los campos título, autor, género y fecha son obligatorios'
      })
  }

  const book = new Book(
      {
          title,
          author,
          genre,
          publication_date
      }
  )

  try {
      const newBook = await book.save()
      console.log(newBook)
      res.status(201).json(newBook)
  } catch (error) {
      res.status(400).json({
          message: error.message
      })
  }
}




const putOne_Books = async(req, res) => {
    try {
        const book = res.book
        book.title = req.body.title || book.title
        book.author = req.body.author || book.author
        book.genre = req.body.genre || book.genre
        book.publication_date = req.body.publication_date || book.publication_date

        const updateBook = await book.save()
        res.json(updateBook)

    } catch (error) {
        res.status(400).json({
            message: error.message
        })   
    }
}

const patchOne_Books = async(req, res) => {
    // Validacion
    if (
        !req.body.title 
        && !req.body.author 
        && !req.body.genre 
        && !req.body.publication_date
    ) {
        res.status(400).json({
            message: 'Al menos uno de estos campos debe ser enviado: title, author, genre, publication_date'
        })   
    }

    // Editar book por ID
    try {
        const book = res.book
        book.title = req.body.title || book.title
        book.author = req.body.author || book.author
        book.genre = req.body.genre || book.genre
        book.publication_date = req.body.publication_date || book.publication_date

        const updateBook = await book.save()
        res.json(updateBook)
        
    } catch (error) {
        res.status(400).json({
            message: error.message
        })   
    }
}

const deleteOne_Books = async(req, res) => {
    try {
        const book = res.book
        await book.deleteOne({
            _id: book._id
        })
        res.json({
            message: `El libro ${book.title} se elimito correctamente`
        })


    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}




// Obtener todos los libros [getAll_Book]
router.get('/', getAll_Books)

// Obtener libro por ID
router.get('/:id', getBook, async(req, res) => {
    res.json(res.book);
})

// Crear un nuevo libro [POST]
router.post('/', postOne_Books)

// Actualizar un libro existente o crear uno nuevo libro
router.put('/:id', getBook, putOne_Books)

// Actualizar uno o mas atributos de un libro existente
router.patch('/:id', getBook, patchOne_Books)

// Borrar un libro existente
router.delete('/:id', getBook, deleteOne_Books)





module.exports = router