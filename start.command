#!/bin/bash
cd "$(dirname "$0")"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
# Stop any old Semak Dulu server still using port 3000
lsof -ti tcp:3000 | xargs kill 2>/dev/null; sleep 1
( sleep 2 && open http://localhost:3000 ) &
npm start
