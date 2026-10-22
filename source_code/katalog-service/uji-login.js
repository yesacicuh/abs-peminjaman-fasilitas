fetch('http://localhost:3001/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: "mhs_satu", password: "123456" })
})
.then(response => response.json())
.then(data => console.log("Hasil Response:\n", data))
.catch(error => console.error("Gagal memanggil API:", error));