a = 10
print("line 1: a = 10")
b = 15
print("line 2: b = 15")
for x in range(3):
    a = a + 1
    print(a)
    print("block starting at line 3:\nline 3: for x in range(3):\nline 4: a = a + 1\nline 5: print(a)")
if a == 15:
    print(a)
    print("block starting at line 6:\nline 6: if a == 15:\nline 7: print(a)")
else:
    print(b)
    print("block starting at line 8:\nline 8: else:\nline 9: print(b)")
print("end")
print("line 10: print(\"end\")")