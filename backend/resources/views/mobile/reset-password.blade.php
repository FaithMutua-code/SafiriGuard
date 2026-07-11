{{-- resources/views/mobile/reset-password.blade.php --}}
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password — SafariGuard</title>
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #F8F9FA;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }

        .card {
            background: #fff;
            border-radius: 16px;
            padding: 32px 28px;
            width: 100%;
            max-width: 400px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        }

        .shield {
            width: 56px;
            height: 56px;
            border-radius: 16px;
            background: #6152FF11;
            border: 1px solid #6152FF33;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 26px;
            margin-bottom: 20px;
        }

        h1 {
            font-size: 22px;
            color: #1E293B;
            margin: 0 0 6px;
        }

        p.subtitle {
            font-size: 13px;
            color: #64748B;
            margin: 0 0 24px;
            line-height: 1.5;
        }

        label {
            font-size: 12px;
            font-weight: 600;
            color: #64748B;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        input {
            width: 100%;
            height: 48px;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 0 14px;
            font-size: 15px;
            color: #1E293B;
            margin: 6px 0 16px;
        }

        input:focus {
            outline: none;
            border-color: #6152FF;
        }

        button {
            width: 100%;
            height: 50px;
            background: #6152FF;
            color: #fff;
            border: none;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
        }

        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .msg {
            font-size: 13px;
            border-radius: 8px;
            padding: 10px 12px;
            margin-bottom: 16px;
        }

        .msg.error {
            background: #EF444411;
            color: #EF4444;
        }

        .msg.success {
            background: #10B98122;
            color: #059669;
        }
    </style>
</head>

<body>
    <div class="card">
        <div class="shield">🛡</div>
        <h1>Set a new password</h1>
        <p class="subtitle">Enter a new password for your SafariGuard account.</p>

        <div id="message"></div>

        <form id="reset-form">
            <input type="hidden" id="token" value="{{ $token }}">
            <input type="hidden" id="email" value="{{ $email }}">

            <label>New Password</label>
            <input type="password" id="password" minlength="8" required>

            <label>Confirm Password</label>
            <input type="password" id="password_confirmation" minlength="8" required>

            <button type="submit" id="submit-btn">Reset Password</button>
        </form>
    </div>

    <script>
        const form = document.getElementById('reset-form');
        const messageEl = document.getElementById('message');
        const submitBtn = document.getElementById('submit-btn');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            messageEl.innerHTML = '';
            submitBtn.disabled = true;
            submitBtn.textContent = 'Resetting...';

            const payload = {
                token: document.getElementById('token').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                password_confirmation: document.getElementById('password_confirmation').value,
            };

            try {
                const res = await fetch('/api/reset-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || 'Something went wrong.');
                }

                messageEl.innerHTML = `<div class="msg success">${data.message || 'Password reset successful. You can now log in from the app.'}</div>`;
                form.style.display = 'none';
            } catch (err) {
                messageEl.innerHTML = `<div class="msg error">${err.message}</div>`;
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Reset Password';
            }
        });
    </script>
</body>

</html>
