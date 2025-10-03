import requests
import json

# Test User Registration
print("🧪 Testing User Registration...")
registration_data = {
    "username": "testuser",
    "email": "test@example.com", 
    "password": "testpass123",
    "password2": "testpass123"
}

try:
    response = requests.post(
        "http://127.0.0.1:8000/api/auth/register/",
        json=registration_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 201:
        print("✅ Registration successful!")
        tokens = response.json()
        access_token = tokens['access']
        refresh_token = tokens['refresh']
    else:
        print("❌ Registration failed!")
        
except Exception as e:
    print(f"Error: {e}")

print("\n" + "="*50 + "\n")

# Test User Login
print("🔐 Testing User Login...")
login_data = {
    "username": "testuser",
    "password": "testpass123"
}

try:
    response = requests.post(
        "http://127.0.0.1:8000/api/auth/login/",
        json=login_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        print("✅ Login successful!")
        tokens = response.json()
        access_token = tokens['access']
        
        # Test Profile View
        print("\n👤 Testing Profile View...")
        profile_response = requests.get(
            "http://127.0.0.1:8000/api/auth/profile/",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
        )
        
        print(f"Profile Status Code: {profile_response.status_code}")
        print(f"Profile Response: {profile_response.json()}")
        
        if profile_response.status_code == 200:
            print("✅ Profile access successful!")
        else:
            print("❌ Profile access failed!")
    else:
        print("❌ Login failed!")
        
except Exception as e:
    print(f"Error: {e}")
