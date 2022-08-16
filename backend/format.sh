cd tests/
black . --line-length 120 --target-version py37
isort .

cd ../backend/
black . --line-length 120 --target-version py37
isort .

cd ..
