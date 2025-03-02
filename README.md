# GlobeTrotter - Travel Quiz

A fun travel quiz application with a "Who Wants to Be a Millionaire" style interface.

## Features
- Interactive quiz with travel-related questions
- "Who Wants to Be a Millionaire" styled question format
- Confetti animation for correct answers
- User authentication system
- Challenge friends via WhatsApp sharing
- Persistent score tracking for registered users

## Deployment on Railway

### Prerequisites
- [Railway account](https://railway.app/)
- [Railway CLI](https://docs.railway.app/develop/cli) (optional for local development)

### Deployment Steps

1. **Fork or clone this repository**

2. **Login to Railway**
   ```
   railway login
   ```

3. **Initialize Railway project**
   ```
   railway init
   ```

4. **Deploy to Railway**
   ```
   railway up
   ```

5. **Set environment variables (if needed)**
   ```
   railway variables set KEY=VALUE
   ```

6. **Open your deployed application**
   ```
   railway open
   ```

### Alternative Deployment via Dashboard

1. Create a new project in the [Railway dashboard](https://railway.app/dashboard)
2. Connect your GitHub repository
3. Railway will automatically detect the Flask app and deploy it
4. Configure environment variables in the Railway dashboard if needed

## Local Development

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the application:
   ```
   python run.py
   ```

3. Access the application at http://localhost:8000

UI: 
welcome screen with start button
on play a icon with quesiton mark appears, kbc styled question format
4 options on screen with lifelines, 

