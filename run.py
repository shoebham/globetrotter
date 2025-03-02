import os
from app import create_app
import multiprocessing
app = create_app()

if __name__ == '__main__':
    # Get port from environment variable or default to 8000
    port = int(os.environ.get('PORT', 8000))
    # Bind to 0.0.0.0 to make the app accessible outside the container
    app.run(
        host='0.0.0.0', port=port,
        debug=True, 
        threaded=True,
        processes=multiprocessing.cpu_count() if os.environ.get('USE_PROCESSES', 'false').lower() == 'true' else 1,
    )

    # app.run(host='0.0.0.0', port=port, debug=False)
