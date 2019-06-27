<ul style="padding-left: 0;list-style: none;">
    <li style="margin-bottom: 3px;">
        <b>{{$text['sender']}}:</b> <span style="margin: 0 5px;">{{$data['sender']}}</span>
        <a href=mailto:{{$data['senderEmail']}}>{{$data['senderEmail']}}</a>
    </li>
    <li style="margin-bottom: 3px;">
        <span><b>{{$text['session_date']}}:</b> <span>{{$data['sessionDate']}}</span></span>
    </li>
    <li style="margin-bottom: 3px;">
        <span><b>{{$text['session_time']}}:</b> <span>{{$data['sessionTime']}}</span></span>
    </li>
    <li style="margin-bottom: 15px;display: flex;">
        <b style="white-space: nowrap">{{$text['msg']}}:</b>
        <span style="display: inline-block;
    			padding: 0 0 15px 5px;
    			border-bottom: 1px solid #ccc;width: 600px;"
        >
			{!! $data['clientMessage'] !!}
		</span>
    </li>
    <li style="margin-bottom: 10px;">
        <span>{{$text['new_videos']}}</span>
        <a href="https://www.cloud-ultrasound.com">www.cloud-ultrasound.com</a> {{$text['new_videos2']}}
    </li>
    <li style="margin-bottom: 0px;">
        <span>{{$text['please_use']}}.</span>
    </li>
    <li style="margin-bottom: 3px;">
        <span>{{$text['your_pass']}}:</span> <span>{{$data['pass']}}</span>
    </li>
</ul>
