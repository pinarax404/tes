<?php

$current_radios = shell_exec("su -c 'settings get global airplane_mode_radios'");
echo $current_radios;
