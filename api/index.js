const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');
const swaggerUi = require('swagger-ui-express');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Path file JSON asli (dibundle saat deploy) dan file sementara (/tmp) agar mendukung tulis/edit di Vercel Serverless
const SOURCE_DATA_PATH = path.join(__dirname, '..', 'data', 'items.json');
const TMP_DATA_PATH = path.join(os.tmpdir(), 'items_data.json');

/**
 * Membaca data dari JSON.
 * Di Vercel, folder project bersifat read-only, sehingga perubahan disimpan di /tmp/items_data.json.
 */
function readItems() {
  try {
    if (fs.existsSync(TMP_DATA_PATH)) {
      const rawTmp = fs.readFileSync(TMP_DATA_PATH, 'utf-8');
      return JSON.parse(rawTmp);
    }
    const rawSource = fs.readFileSync(SOURCE_DATA_PATH, 'utf-8');
    const data = JSON.parse(rawSource);
    return data;
  } catch (error) {
    console.error('Gagal membaca data JSON:', error);
    return [];
  }
}

/**
 * Menyimpan perubahan data ke JSON.
 * Mencoba menulis ke file lokal jika di environment development, atau ke /tmp jika di Vercel.
 */
function writeItems(items) {
  const jsonString = JSON.stringify(items, null, 2);
  try {
    if (!process.env.VERCEL) {
      fs.writeFileSync(SOURCE_DATA_PATH, jsonString, 'utf-8');
    }
  } catch (err) {
    // Abaikan jika read-only filesystem
  }
  try {
    fs.writeFileSync(TMP_DATA_PATH, jsonString, 'utf-8');
  } catch (err) {
    console.error('Gagal menulis ke temporary file:', err);
  }
}

// Konfigurasi OpenAPI / Swagger Specification
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Simple JSON REST API (Vercel Ready)',
    version: '1.0.0',
    description: 'Dokumentasi REST API sederhana menggunakan sumber data file JSON, siap di-deploy ke Vercel.'
  },
  servers: [
    {
      url: '/',
      description: 'Current Server (Local / Vercel)'
    }
  ],
  paths: {
    '/api/items': {
      get: {
        summary: 'Ambil semua data item',
        tags: ['Items'],
        parameters: [
          {
            name: 'category',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Filter berdasarkan kategori (contoh: Accessories, Monitor, Audio)'
          },
          {
            name: 'search',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Cari item berdasarkan nama atau deskripsi'
          }
        ],
        responses: {
          200: {
            description: 'Berhasil mengambil daftar item'
          }
        }
      },
      post: {
        summary: 'Tambah item baru',
        tags: ['Items'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'category', 'price'],
                properties: {
                  name: { type: 'string', example: 'Webcam Full HD 1080p' },
                  category: { type: 'string', example: 'Accessories' },
                  price: { type: 'number', example: 350000 },
                  stock: { type: 'number', example: 30 },
                  description: { type: 'string', example: 'Webcam jernih dengan mikrofon internal.' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Item berhasil ditambahkan' },
          400: { description: 'Input tidak valid' }
        }
      }
    },
    '/api/items/{id}': {
      get: {
        summary: 'Ambil detail item berdasarkan ID',
        tags: ['Items'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID item'
          }
        ],
        responses: {
          200: { description: 'Detail item ditemukan' },
          404: { description: 'Item tidak ditemukan' }
        }
      },
      put: {
        summary: 'Update data item berdasarkan ID',
        tags: ['Items'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID item'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Mechanical Keyboard RGB Pro' },
                  category: { type: 'string', example: 'Accessories' },
                  price: { type: 'number', example: 800000 },
                  stock: { type: 'number', example: 20 },
                  description: { type: 'string', example: 'Versi terbaru dengan baterai lebih besar.' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Item berhasil diperbarui' },
          404: { description: 'Item tidak ditemukan' }
        }
      },
      delete: {
        summary: 'Hapus item berdasarkan ID',
        tags: ['Items'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID item'
          }
        ],
        responses: {
          200: { description: 'Item berhasil dihapus' },
          404: { description: 'Item tidak ditemukan' }
        }
      }
    },
    '/api/reset': {
      post: {
        summary: 'Reset data kembali ke file JSON awal',
        tags: ['Items'],
        responses: {
          200: { description: 'Data berhasil di-reset ke kondisi awal' }
        }
      }
    }
  }
};

// Gunakan CDN untuk asset Swagger UI agar tidak error blank page saat di-deploy ke Vercel Serverless
const swaggerOptions = {
  customSiteTitle: 'API Docs - JSON REST API',
  customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.min.css',
  customJs: [
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-standalone-preset.min.js'
  ]
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

// Endpoint spesifikasi OpenAPI mentah
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerDocument);
});

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Selamat datang di Simple JSON REST API!',
    endpoints: {
      documentation: '/api-docs',
      openapi_spec: '/api-docs.json',
      get_all_items: '/api/items',
      get_single_item: '/api/items/:id',
      reset_data: '/api/reset'
    }
  });
});

// GET /api/items - Ambil semua item (dengan filter opsional)
app.get('/api/items', (req, res) => {
  const { category, search } = req.query;
  let items = readItems();

  if (category) {
    items = items.filter(
      (item) => item.category.toLowerCase() === String(category).toLowerCase()
    );
  }

  if (search) {
    const keyword = String(search).toLowerCase();
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        (item.description && item.description.toLowerCase().includes(keyword))
    );
  }

  res.json({
    success: true,
    total: items.length,
    data: items
  });
});

// GET /api/items/:id - Ambil 1 item berdasarkan ID
app.get('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const items = readItems();
  const item = items.find((i) => i.id === id);

  if (!item) {
    return res.status(404).json({
      success: false,
      message: `Item dengan ID ${id} tidak ditemukan.`
    });
  }

  res.json({
    success: true,
    data: item
  });
});

// POST /api/items - Tambah item baru
app.post('/api/items', (req, res) => {
  const { name, category, price, stock, description } = req.body;

  if (!name || !category || price === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Field name, category, dan price wajib diisi.'
    });
  }

  const items = readItems();
  const newId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;

  const newItem = {
    id: newId,
    name,
    category,
    price: Number(price),
    stock: stock !== undefined ? Number(stock) : 0,
    description: description || ''
  };

  items.push(newItem);
  writeItems(items);

  res.status(201).json({
    success: true,
    message: 'Item berhasil ditambahkan.',
    data: newItem
  });
});

// PUT /api/items/:id - Update item berdasarkan ID
app.put('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const items = readItems();
  const index = items.findIndex((i) => i.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Item dengan ID ${id} tidak ditemukan.`
    });
  }

  const { name, category, price, stock, description } = req.body;
  const updatedItem = {
    ...items[index],
    ...(name !== undefined && { name }),
    ...(category !== undefined && { category }),
    ...(price !== undefined && { price: Number(price) }),
    ...(stock !== undefined && { stock: Number(stock) }),
    ...(description !== undefined && { description })
  };

  items[index] = updatedItem;
  writeItems(items);

  res.json({
    success: true,
    message: 'Item berhasil diperbarui.',
    data: updatedItem
  });
});

// DELETE /api/items/:id - Hapus item berdasarkan ID
app.delete('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const items = readItems();
  const index = items.findIndex((i) => i.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Item dengan ID ${id} tidak ditemukan.`
    });
  }

  const deleted = items.splice(index, 1)[0];
  writeItems(items);

  res.json({
    success: true,
    message: 'Item berhasil dihapus.',
    data: deleted
  });
});

// POST /api/reset - Reset data ke isi awal data/items.json
app.post('/api/reset', (req, res) => {
  try {
    if (fs.existsSync(TMP_DATA_PATH)) {
      fs.unlinkSync(TMP_DATA_PATH);
    }
    const initialItems = readItems();
    res.json({
      success: true,
      message: 'Data berhasil di-reset ke kondisi awal.',
      data: initialItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal me-reset data.'
    });
  }
});

// Jalankan server jika dieksekusi langsung di lokal (bukan di-import oleh Vercel)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log(`Swagger UI tersedia di http://localhost:${PORT}/api-docs`);
  });
}

// Export untuk Vercel Serverless Function
module.exports = app;

