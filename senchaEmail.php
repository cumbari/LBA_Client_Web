<?php
	
	 $from    = $_GET['from'];
	 $message = $_GET['message'];
    
	$to		 = 'feedback@cumbari.com';
    
	 //$to		 = 'shashank.shukla@shephertz.co.in';

	 $headers  = "From: $from" . "\n";
     $headers .= 'MIME-Version: 1.0' . "\n";
     $headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n"; 
	
	$subject =  substr($message,0,10);

	if(mail($to,$subject,$message,$headers))
	{
		 echo 'Your message has been sent successfully. ';
	}
	else
	{
		 echo 'Message sending failed.';
	}

?>