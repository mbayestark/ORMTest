const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const { drizzle } = require('drizzle-orm/mysql2');
const { books } = require('./schema.js');

// MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', 
  password: 'Sindidi', 
  database: 'book_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const db = drizzle(pool);

const app = express();
app.use(bodyParser.json());

// GET /api/books
app.get('/api/books', async (req, res) => {
  try {
    const allBooks = await db.select().from(books);

    if (allBooks.length==0){
        return res.json({message:'No books in the database'});
    }
    res.json(allBooks);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// POST /api/books
app.post('/api/books', async (req, res) => {
  const { title, author, isbn, publication_year, genre } = req.body;
  
  // Validation
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'Valid title is required' });
  }
  if (!author || typeof author !== 'string') {
    return res.status(400).json({ error: 'Valid author is required' });
  }
  if (!isbn || typeof isbn !== 'string' || isbn.length !== 13) {
    return res.status(400).json({ error: 'Valid 13-character ISBN is required' });
  }
  if (publication_year && (isNaN(publication_year) || publication_year < 1000 || publication_year > new Date().getFullYear())) {
    return res.status(400).json({ error: 'Invalid publication year' });
  }

  try {
    const [newBook] = await db.insert(books).values({ 
      title, 
      author, 
      isbn, 
      publication_year: publication_year || null, 
      genre: genre || null 
    })
    
    res.status(201).json({
      message: 'Book created',
      book: newBook
    });
    
  } catch (err) {
    console.error("Insert error:", err);
    if (err.errno === 1062) {
      return res.status(409).json({ error: 'Book with this ISBN already exists' });
    }
    console.error('Error creating book:', err);
    res.status(500).json({ error: 'Failed to create book' });
  }
});

const PORT = 3003;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
