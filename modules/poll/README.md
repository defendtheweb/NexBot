# Poll
A module to allow any user to run and vote on a poll. A poll can only be ended by the user who created it.

Example:
```
!poll <Title>
NexBot: Poll started - <Title>
!vote <blah>
!vote <blah2>
!vote <blah>
!poll end
NexBot: <blah> wins. <blah> (2 vote), <blah2> (1 vote)
```

If a poll is already running
```
!poll <Title>
NexBot: A poll is already running - <Title>

!poll
NexBot: Current poll: <title>
```

#Usage
```!poll <Title>``` 	- Start a Poll  
```!vote <Vote>``` 		- Enter vote into poll  
```!poll end``` 		- Ends the Poll  