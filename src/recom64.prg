�� 1310 �: 0�� ***** SUBROUTINEN ***** 6: A�19,64 I�A$ S$�19,0 Y.� _8� vB�1,X1$,X2$,X3$,X4$ �LD��(X1$) �VD$�X1$�","�X2$�","�X3$�","�X4$ �`� �j�#2,L$,H$ �tAD��(L$��(0))�256��(H$��(0)) �~� ��DA$�"" ���#2,X$ 	��X$��""�DA$�DA$�X$:� 1170 	�� (	��YY�1�SS C	�: �JA�S(YY)�JN�U(YY):� I	�� l	�ERR$�"�NDEF'D �TATEMENT �RROR" y	�ERR�D(I) �	�� 3580 �	�JN�63999 �	�� �	 : �	
� ***** INITIALISIEREN ****** �	: �	�S$(500),S(500),U(500),D$(1000),D(1000) �	(GA�8 
2SP$�":                    " *
<� 20 SPACES 0
F: T
P� ***** PARAMETER-EINGABE ***** Z
Z: �
d�"�      �ECOMPACTOR    BY ��-�OFT " �
n�" �OURCE-�ILENAME      : "; �
x� 1040 �
�SN$�A$ �
��" �ESTINATION-�ILENAME : "; �
�� 1040 �
�DN$�A$  ��" �CHLEIFEN FORMATIEREN (J/N) : "; +��204,0 4��FO$ Z��FO$��"J"�FO$��"Y"�FO$��"N"� 1470 e��204,1 n��FO$ ���" �TARTADRESSE  : 2049����"; ��� 1040 ��SA��(A$) ��" �TARTZEILENNR.: 1000����"; �� 1040 �SZ��(A$) "�" �CHRITTWEITE  : 10��"; ,� 1040 6SW��(A$) G@�"�      �ECOMPACTOR    BY ��-�OFT " iJ�"   �OURCEFILE      : "SN$ �T�"   �ESTINATIONFILE : "DN$ �^: �h�*****        PASS 1        ***** �r: �|�""�3)"�ASS 1 :" ���1,GA,15 ���2,GA,0,SN$ �� 1090 ��D��2:�1:� 3600:� %�� 1130 0�� 1130 G��AD�0��2:�1:� 1840 R�� 1130 k��""�11)AD w�SS�SS�1 ��S(SS)�AD ��� 1160 ��S$(SS)�DA$ �� 1720 �: �� ***** PASS 2 ***** �&: �0�""�23)"�ASS 2 :" �:�I�1�SS D: �""�31)S(I) ,N: U(I)�SW�DD�SZ 7X: F1�0 Bb: F2�0 Ml: F3�0 av: �M�1��(S$(I)) y�:   X$��(S$(I),M,1) ��:   X��(X$��(0)) ��:   �X$�":"�ZE$��""� 2010 ��:   �X�139�F1�1 ��:   �X�143�F1�1 ��:   �X�34�F2�1�F2 ��:   ZE$�ZE$�X$ �: �M �: F3�1 .�: �F3�0�� F1 � F2 � 1980 <�: DD�DD�1 M�: D$(DD)�ZE$ Z�: ZE$�"" r: D(DD)�SW�DD�SZ�SW �F3�0��M �S$(I)�"" � �I �*�D(DD)�63999�ERR$�"�INE �NCREMENT TOO LARGE !":ERR�0:� 3580:� �4: �>� ***** PASS 3 ***** �H: R�""�3)"�ASS 3 :" )\�I�1�DD 4f: MM�. ?p: F1�. Jz: F2�. j�: �""�11)D(I) x�: MM�MM�1 ���MM��(D$(I))��I:� 3090 ��YY��(�(D$(I),MM,1)��(0)) ���YY�34�F2�1�F2      :� FALLS ��YY�143�F1�1 :� ANFUEHRUNGSZEICHEN ODER REM, (��F1�F2� 2190:� DANN NICHT PRUEFEN N��YY�137�YY�141� 2310:� GOTO/GOSUB {��YY�167� 2490:� THEN-MIT/OHNE ZEILENNR.? ���YY�145� 2570:� ON... ���YY�203� 2980:� GO ��� 2190 ��� GOTO/GOSUB �	JA�. �	JA$�"" �	NN�. �$	NN�NN�1 
.	NN$��(D$(I),MM�NN,1) 08	�(NN$�"0"�NN$�"9")�NN$��" "� 2390 @B	JA$�JA$�NN$ KL	� 2340 YV	JA��(JA$) d`	� 1200 xj	LI$��(D$(I),MM) �t	RE$��(D$(I),MM�NN) �~	D$(I)�LI$��(JN)�RE$ ��	MM�MM�NN ��	� 2190 ��	� THEN �	� ERST PRUEFEN OB ZEILENNUMMER, WENN JA, DANN SPRUNG ZUR G�	� ADRESSENUMWANDLUNG (AB 2310, AUCH BEI GOTO/GOSUB BENUTZT) P�	NN�. Y�	F4�. e�	NN�NN�1 ~�	NN$��(D$(I),MM�NN,1) ��	�(NN$�"0"�NN$�"9")�NN$��" "� 2190 ��	�NN$�" "� 2510:� SPACE UEBERLESEN ��	� 2310 � 
� ON...GOTO/ON...GOSUB �

MM�MM�1 
AS��(�(D$(I),MM,1)��(0)) 2
�AS�137�AS�141� 2760 D(
�AS�203� 2670 [2
�MM��(D$(I))� 2570 |<
ERR$�"�� WITHOUT ���� �RROR" �F
ERR�D(I) �P
� 3580 �Z
�I �d
� NACH 'ON...GO' AUF 'TO' PRUEFEN �n
MM�MM�1 �x
AS��(�(D$(I),MM,1)��(0)) ��
�AS�164� 2760 �
�MM��(D$(I))� 2670 2�
ERR$�"�� WITHOUT �� �RROR" ?�
ERR�D(I) J�
� 3580 Q�
�I ��
� ADRESSEN EINZELN HOLEN UND GLEICH UMWANDELN ��
NN�. ��
MM�MM�NN ��
NN�. ��
JA$�"" ��
NN�NN�1 ��
NN$��(D$(I),MM�NN,1) ��(NN$�"0"�NN$�"9")�NN$��" "�� 2850 	JA$�JA$�NN$ � 2800 ""JA��(JA$) -,� 1200 A6LI$��(D$(I),MM) X@RE$��(D$(I),MM�NN) pJD$(I)�LI$��(JN)�RE$ |TNN�NN�1 �^NN�NN�1 �hNN$��(D$(I),MM�NN,1) �r�NN$�" "� 2910 �|�NN$�","� 2770 ���NN$�":"�MM�NN��(D$(I))�MM�MM�NN:� 2190 ��� 2910 �� NACH 'GO' AUF 'TO' PRUEFEN +�MM�MM�1 H�AS��(�(D$(I),MM,1)��(0)) g��AS�164� 2310:�TO GEFUNDEN ~��MM��(D$(I))� 2980 ��ERR$�"�� WITHOUT �� �RROR" ��ERR�D(I) ��� 3580 ���I ��: ��� ***** PASS 4 ***** �: ��FO$��"J"�FO$��"Y"� 3300 "�""�23)"�ASS 4 :" +&FO�0 70�I�1�DD B:: MM�. MD: F1�. XN: F2�. tX: D$(I)��(SP$,FO)�D$(I) �b: �""�31)D(I) �l: MM�MM�1 �v�MM��(D$(I))��I:� 3300 ��YY��(�(D$(I),MM,1)��(0)) ���YY�34�F2�1�F2      :� FALLS ,��YY�143�F1�1 :� ANFUEHRUNGSZEICHEN ODER REM, R��F1�F2� 3180:� DANN NICHT PRUEFEN ���YY�129 � FO�FO�2 :� FOR -> SCHACHTELUNGSTIEFE +1 ���YY�130 � FO�0 � FO�FO�2 :D$(I)��(SP$,FO)��(D$(I),FO�3) ��� 3180 ��: ��� ***** SAVE ***** ��: ��""�16)" SAVING " (��1,GA,15 8��2,GA,1,DN$ C� 1090 ^�D��2:�1:� 3600:� 3300 hAD�SA v LB�255�SA �*HB�SA�256 �4�2,�(LB)�(HB); �>�I�1�DD �H: AD�AD��(D$(I))�5 �R: LP�255�AD �\: HP�AD�256 �f: �2,�(LP)�(HP); p: LZ�D(I)�255 z: HZ�D(I)�256 (�: �2,�(LZ)�(HZ); <�: �2,D$(I)�(0); B�� S��2,�(0)�(0); Z��2 a��1 ���"  �RRORS :"ER% ��� ��� ��: ��� ***** FEHLER ***** ��: ��D$�ERR$ �D�ERR �"ERROR FOR "SN$" :" �"�"D$; '$�D���(D$)��"IN";D; 5.�T�1�5000 ?8: �A$ LB�A$�""�� �L�"                                       " �V�"                                       "; �`�   