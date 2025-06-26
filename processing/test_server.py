#!/usr/bin/env python3
"""
Script di test per il Music Sheet Processing Server
"""

import requests
import json
import time
import sys
import os

SERVER_URL = "http://localhost:5001"


def test_server_health():
    """Testa se il server è attivo e funzionante"""
    try:
        response = requests.get(f"{SERVER_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Server attivo: {data['status']}")
            print(f"📅 Timestamp: {data['timestamp']}")
            return True
        else:
            print(f"❌ Server risponde con errore: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Server non raggiungibile: {e}")
        return False


def test_api_info():
    """Testa gli endpoint informativi"""
    try:
        # Test API info
        response = requests.get(
            f"{SERVER_URL}/", headers={"Accept": "application/json"}, timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API Info: {data['message']} v{data['version']}")
            print(f"📋 Endpoint disponibili: {len(data['endpoints'])}")

        # Test API docs
        response = requests.get(f"{SERVER_URL}/api/docs", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Documentazione API: {data['title']}")
            print(f"🔄 Passi di processamento: {len(data['processing_steps'])}")

        return True
    except requests.exceptions.RequestException as e:
        print(f"❌ Errore nel test API info: {e}")
        return False


def test_jobs_endpoint():
    """Testa l'endpoint dei lavori"""
    try:
        response = requests.get(f"{SERVER_URL}/jobs", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Endpoint jobs: {data['total']} lavori trovati")
            if data["jobs"]:
                print("📋 Lavori recenti:")
                for job in data["jobs"][:3]:  # Mostra solo i primi 3
                    status_emoji = (
                        "✅"
                        if job["status"] == "completed"
                        else "⏳" if job["status"] == "processing" else "❌"
                    )
                    print(f"   {status_emoji} {job['filename']} - {job['status']}")
            return True
        else:
            print(f"❌ Errore endpoint jobs: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Errore nel test jobs: {e}")
        return False


def test_demo_page():
    """Testa se la pagina demo è accessibile"""
    try:
        response = requests.get(f"{SERVER_URL}/demo", timeout=5)
        if response.status_code == 200 and "Music Sheet Processor" in response.text:
            print("✅ Demo page accessibile")
            return True
        else:
            print(f"❌ Demo page non funzionante: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Errore nel test demo page: {e}")
        return False


def test_file_upload(test_file=None):
    """Testa l'upload di un file (se fornito)"""
    if not test_file or not os.path.exists(test_file):
        print("⚠️  Nessun file di test fornito per l'upload")
        return True

    try:
        print(f"🔄 Test upload file: {test_file}")

        with open(test_file, "rb") as f:
            files = {"file": f}
            response = requests.post(f"{SERVER_URL}/upload", files=files, timeout=30)

        if response.status_code == 200:
            data = response.json()
            job_id = data.get("job_id")
            print(f"✅ Upload completato: Job ID {job_id}")

            # Test recupero risultati
            if job_id:
                result_response = requests.get(
                    f"{SERVER_URL}/process/{job_id}", timeout=10
                )
                if result_response.status_code == 200:
                    result_data = result_response.json()
                    print(
                        f"✅ Risultati recuperati: Status {result_data.get('status')}"
                    )
                    if result_data.get("result"):
                        staffs = result_data["result"].get("staffs_detected", 0)
                        print(f"🎼 Pentagrammi rilevati: {staffs}")

            return True
        else:
            print(f"❌ Errore upload: {response.status_code}")
            print(f"   {response.text}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"❌ Errore nel test upload: {e}")
        return False


def main():
    """Esegue tutti i test"""
    print("🧪 Test del Music Sheet Processing Server")
    print("=" * 50)

    # Parse argomenti
    test_file = sys.argv[1] if len(sys.argv) > 1 else None

    tests = [
        ("Health Check", test_server_health),
        ("API Info", test_api_info),
        ("Jobs Endpoint", test_jobs_endpoint),
        ("Demo Page", test_demo_page),
        ("File Upload", lambda: test_file_upload(test_file)),
    ]

    passed = 0
    total = len(tests)

    for test_name, test_func in tests:
        print(f"\n🔍 {test_name}...")
        if test_func():
            passed += 1
        time.sleep(0.5)  # Piccola pausa tra i test

    print("\n" + "=" * 50)
    print(f"📊 Risultati: {passed}/{total} test passati")

    if passed == total:
        print("🎉 Tutti i test sono passati! Il server funziona correttamente.")
        print(f"🌐 Accedi alla demo: {SERVER_URL}/demo")
    else:
        print("⚠️  Alcuni test sono falliti. Controlla i log del server.")
        sys.exit(1)


if __name__ == "__main__":
    main()
