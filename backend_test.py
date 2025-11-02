#!/usr/bin/env python3
"""
Backend API Testing for Global Leaderboards and Trivia System
Tests all user, leaderboard, and trivia endpoints with proper validation
"""

import requests
import json
import sys
from datetime import datetime
import time

# Get backend URL from environment
BACKEND_URL = "https://keymancer.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.registered_user = None
        
    def log_test(self, test_name, success, details="", response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        print()
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response": response_data
        })
    
    def test_user_registration(self):
        """Test user registration endpoint"""
        print("=== TESTING USER REGISTRATION ===")
        
        # Test 1: Register new user
        try:
            payload = {"username": "TestPlayer123"}
            response = self.session.post(f"{BACKEND_URL}/user/register", json=payload)
            
            if response.status_code == 200:
                user_data = response.json()
                self.registered_user = user_data
                self.log_test(
                    "POST /api/user/register - New user registration",
                    True,
                    f"User registered with ID: {user_data.get('id')}, Username: {user_data.get('username')}"
                )
            else:
                self.log_test(
                    "POST /api/user/register - New user registration",
                    False,
                    f"Status: {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test(
                "POST /api/user/register - New user registration",
                False,
                f"Exception: {str(e)}"
            )
        
        # Test 2: Test duplicate username (should fail)
        try:
            payload = {"username": "TestPlayer123"}
            response = self.session.post(f"{BACKEND_URL}/user/register", json=payload)
            
            if response.status_code == 400:
                self.log_test(
                    "POST /api/user/register - Duplicate username rejection",
                    True,
                    "Correctly rejected duplicate username"
                )
            else:
                self.log_test(
                    "POST /api/user/register - Duplicate username rejection",
                    False,
                    f"Expected 400, got {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test(
                "POST /api/user/register - Duplicate username rejection",
                False,
                f"Exception: {str(e)}"
            )
    
    def test_user_retrieval(self):
        """Test user retrieval endpoints"""
        print("=== TESTING USER RETRIEVAL ===")
        
        if not self.registered_user:
            self.log_test(
                "GET /api/user/username/{username} - User retrieval",
                False,
                "No registered user available for testing"
            )
            return
        
        # Test: Get user by username
        try:
            username = self.registered_user['username']
            response = self.session.get(f"{BACKEND_URL}/user/username/{username}")
            
            if response.status_code == 200:
                user_data = response.json()
                if user_data['username'] == username and user_data['id'] == self.registered_user['id']:
                    self.log_test(
                        "GET /api/user/username/TestPlayer123 - User retrieval",
                        True,
                        f"Successfully retrieved user: {user_data['username']}"
                    )
                else:
                    self.log_test(
                        "GET /api/user/username/TestPlayer123 - User retrieval",
                        False,
                        "User data mismatch",
                        user_data
                    )
            else:
                self.log_test(
                    "GET /api/user/username/TestPlayer123 - User retrieval",
                    False,
                    f"Status: {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test(
                "GET /api/user/username/TestPlayer123 - User retrieval",
                False,
                f"Exception: {str(e)}"
            )
    
    def test_leaderboard_submission(self):
        """Test leaderboard submission endpoints"""
        print("=== TESTING LEADERBOARD SUBMISSION ===")
        
        if not self.registered_user:
            self.log_test(
                "POST /api/leaderboard/submit - Valid score submission",
                False,
                "No registered user available for testing"
            )
            return
        
        # Test 1: Submit valid score
        try:
            payload = {
                "user_id": self.registered_user['id'],
                "username": "TestPlayer123",
                "mode": "words",
                "difficulty": "normal",
                "wpm": 85.5,
                "accuracy": 95.0,
                "time_seconds": 15.5,
                "score": 0,
                "mistakes": 3,
                "streak": 5,
                "keystroke_data": [120, 150, 130, 140, 160, 145, 135, 155],
                "total_keystrokes": 40
            }
            
            response = self.session.post(f"{BACKEND_URL}/leaderboard/submit", json=payload)
            
            if response.status_code == 200:
                entry_data = response.json()
                self.log_test(
                    "POST /api/leaderboard/submit - Valid score submission",
                    True,
                    f"Score submitted: {entry_data.get('wpm')} WPM, {entry_data.get('accuracy')}% accuracy"
                )
            else:
                self.log_test(
                    "POST /api/leaderboard/submit - Valid score submission",
                    False,
                    f"Status: {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test(
                "POST /api/leaderboard/submit - Valid score submission",
                False,
                f"Exception: {str(e)}"
            )
        
        # Test 2: Submit suspicious score (anti-cheat test)
        try:
            payload = {
                "user_id": self.registered_user['id'],
                "username": "TestPlayer123",
                "mode": "words",
                "difficulty": "normal",
                "wpm": 250.0,  # Suspicious: > 200 WPM
                "accuracy": 100.0,
                "time_seconds": 2.0,  # Suspicious: too fast
                "score": 0,
                "mistakes": 0,
                "streak": 5,
                "keystroke_data": [30, 30, 30, 30, 30],  # Suspicious: too consistent
                "total_keystrokes": 25
            }
            
            response = self.session.post(f"{BACKEND_URL}/leaderboard/submit", json=payload)
            
            if response.status_code == 400:
                self.log_test(
                    "POST /api/leaderboard/submit - Anti-cheat rejection",
                    True,
                    "Correctly rejected suspicious score"
                )
            else:
                self.log_test(
                    "POST /api/leaderboard/submit - Anti-cheat rejection",
                    False,
                    f"Expected 400, got {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test(
                "POST /api/leaderboard/submit - Anti-cheat rejection",
                False,
                f"Exception: {str(e)}"
            )
    
    def test_leaderboard_rankings(self):
        """Test leaderboard rankings endpoints"""
        print("=== TESTING LEADERBOARD RANKINGS ===")
        
        # Test 1: Get all-time rankings
        try:
            response = self.session.get(f"{BACKEND_URL}/leaderboard/rankings")
            
            if response.status_code == 200:
                rankings = response.json()
                self.log_test(
                    "GET /api/leaderboard/rankings - All-time rankings",
                    True,
                    f"Retrieved {len(rankings)} ranking entries"
                )
            else:
                self.log_test(
                    "GET /api/leaderboard/rankings - All-time rankings",
                    False,
                    f"Status: {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test(
                "GET /api/leaderboard/rankings - All-time rankings",
                False,
                f"Exception: {str(e)}"
            )
        
        # Test 2: Get filtered rankings (mode and difficulty)
        try:
            params = {"mode": "words", "difficulty": "normal"}
            response = self.session.get(f"{BACKEND_URL}/leaderboard/rankings", params=params)
            
            if response.status_code == 200:
                rankings = response.json()
                self.log_test(
                    "GET /api/leaderboard/rankings - Filtered by mode and difficulty",
                    True,
                    f"Retrieved {len(rankings)} filtered entries"
                )
            else:
                self.log_test(
                    "GET /api/leaderboard/rankings - Filtered by mode and difficulty",
                    False,
                    f"Status: {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test(
                "GET /api/leaderboard/rankings - Filtered by mode and difficulty",
                False,
                f"Exception: {str(e)}"
            )
        
        # Test 3: Get daily rankings
        try:
            params = {"period": "daily"}
            response = self.session.get(f"{BACKEND_URL}/leaderboard/rankings", params=params)
            
            if response.status_code == 200:
                rankings = response.json()
                self.log_test(
                    "GET /api/leaderboard/rankings - Daily rankings",
                    True,
                    f"Retrieved {len(rankings)} daily entries"
                )
            else:
                self.log_test(
                    "GET /api/leaderboard/rankings - Daily rankings",
                    False,
                    f"Status: {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test(
                "GET /api/leaderboard/rankings - Daily rankings",
                False,
                f"Exception: {str(e)}"
            )
    
    def test_trivia_endpoints(self):
        """Test trivia endpoints"""
        print("=== TESTING TRIVIA ENDPOINTS ===")
        
        # Test 1: Get daily trivia questions
        try:
            response = self.session.get(f"{BACKEND_URL}/trivia/daily")
            
            if response.status_code == 200:
                questions = response.json()
                if len(questions) == 5:
                    self.log_test(
                        "GET /api/trivia/daily - Daily trivia questions",
                        True,
                        f"Retrieved {len(questions)} daily questions"
                    )
                else:
                    self.log_test(
                        "GET /api/trivia/daily - Daily trivia questions",
                        False,
                        f"Expected 5 questions, got {len(questions)}",
                        questions
                    )
            else:
                self.log_test(
                    "GET /api/trivia/daily - Daily trivia questions",
                    False,
                    f"Status: {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test(
                "GET /api/trivia/daily - Daily trivia questions",
                False,
                f"Exception: {str(e)}"
            )
        
        # Test 2: Get random trivia questions
        try:
            params = {"limit": 3}
            response = self.session.get(f"{BACKEND_URL}/trivia/questions", params=params)
            
            if response.status_code == 200:
                questions = response.json()
                if len(questions) <= 3:  # Could be less if database has fewer questions
                    self.log_test(
                        "GET /api/trivia/questions - Random questions with limit",
                        True,
                        f"Retrieved {len(questions)} random questions"
                    )
                else:
                    self.log_test(
                        "GET /api/trivia/questions - Random questions with limit",
                        False,
                        f"Expected max 3 questions, got {len(questions)}",
                        questions
                    )
            else:
                self.log_test(
                    "GET /api/trivia/questions - Random questions with limit",
                    False,
                    f"Status: {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test(
                "GET /api/trivia/questions - Random questions with limit",
                False,
                f"Exception: {str(e)}"
            )
    
    def run_all_tests(self):
        """Run all backend tests"""
        print(f"Starting Backend API Tests")
        print(f"Backend URL: {BACKEND_URL}")
        print(f"Test started at: {datetime.now()}")
        print("=" * 60)
        
        # Run tests in order
        self.test_user_registration()
        self.test_user_retrieval()
        self.test_leaderboard_submission()
        self.test_leaderboard_rankings()
        self.test_trivia_endpoints()
        
        # Summary
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\nFAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"❌ {result['test']}")
                    if result['details']:
                        print(f"   {result['details']}")
        
        return failed_tests == 0


if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)