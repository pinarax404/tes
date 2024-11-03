<?php

shell_exec("su -c 'settings put global airplane_mode_on 1'");
shell_exec("su -c 'am broadcast -a android.intent.action.AIRPLANE_MODE --ez state true'");
