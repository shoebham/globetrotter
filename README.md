# GlobeTrotter

GlobeTrotter is a geography quiz application that tests your knowledge of cities around the world. The application presents clues about a city and asks you to identify it from multiple options.

## Features

- Geography quiz with cities from around the world
- Multiple-choice questions with clues
- User authentication and score tracking
- Fun facts about cities after answering
- High-performance backend with optimized database access

## Tech Stack

- **Backend**: Flask (Python)
- **Database**: SQLite (with optional in-memory mode)
- **Frontend**: HTML, CSS, JavaScript

## Performance Optimizations

The application includes several performance optimizations:

- **Connection Pooling**: Reuses database connections instead of creating new ones for each request
- **In-Memory Database**: Optional in-memory SQLite database for faster access
- **Caching**: Multiple caching layers for frequently accessed data
- **JSON Pre-parsing**: Pre-processes JSON data to avoid repeated parsing
- **Asynchronous Processing**: Non-blocking user score updates
- **Dictionary Lookups**: O(1) lookups instead of linear searches
- **Database Indexing**: Optimized database indexes for faster queries

## Installation

### Prerequisites

- Python 3.8+
- pip (Python package manager)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/globetrotter.git
   cd globetrotter
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Initialize the database:
   ```bash
   python -c "from app.models.db import init_db; init_db()"
   ```

## Running the Application

### Development Mode

```bash
python run.py
```

The application will be available at http://localhost:8000

### Configuration Options

You can configure the application using environment variables:

- `PORT`: Port to run the application on (default: 8000)
- `USE_MEMORY_DB`: Use in-memory database for better performance (default: true)
- `USE_OPTIMIZATIONS`: Enable performance optimizations (default: true)
- `USE_PROCESSES`: Use multiple processes for better performance on multi-core systems (default: false)

Example:
```bash
export USE_MEMORY_DB=true
export USE_OPTIMIZATIONS=true
python run.py
```

## Performance Testing

The project includes tools to measure and compare performance with different configurations:

### Running Performance Tests

```bash
# Make the script executable
chmod +x run_performance_test.sh

# Run the performance tests
./run_performance_test.sh
```

This will run tests with different optimization configurations and report the results.

### Manual Performance Testing

You can also test performance manually:

```bash
python performance_test.py --requests 20 --concurrent
```

Options:
- `--requests`: Number of requests to make (default: 10)
- `--concurrent`: Make concurrent requests instead of sequential
- `--url`: Base URL of the API (default: http://localhost:5000)

## Deployment

### Railway

1. Create a new project on [Railway](https://railway.app/)
2. Connect your GitHub repository
3. Add the following environment variables:
   - `USE_MEMORY_DB=true`
   - `USE_OPTIMIZATIONS=true`
4. Deploy the application

### Docker

1. Build the Docker image:
   ```bash
   docker build -t globetrotter .
   ```

2. Run the container:
   ```bash
   docker run -p 8000:8000 -e USE_MEMORY_DB=true -e USE_OPTIMIZATIONS=true globetrotter
   ```

## Project Structure

```
globetrotter/
├── app/                    # Application package
│   ├── __init__.py         # Application factory
│   ├── models/             # Database models
│   │   └── db.py           # Database connection and operations
│   ├── routes/             # Route definitions
│   │   ├── api.py          # API routes
│   │   └── main.py         # Main routes
│   ├── static/             # Static files (CSS, JS, images)
│   └── templates/          # HTML templates
├── data/                   # Data files
│   └── cities.json         # Sample city data
├── performance_test.py     # Performance testing script
├── run_performance_test.sh # Performance test runner
├── run.py                  # Application entry point
└── README.md               # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

