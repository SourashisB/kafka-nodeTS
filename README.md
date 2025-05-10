# kafka-nodeTS
I'm going to make my own Apache Kafka but with NodeTS completely. (NOT A SERIOUS PACKAGE, JUST FOR PRACTICE)


# Current Status

Done:
  Core Concepts
  	Topics: Streams of related messages organized into categories
  	Partitions: Subdivisions of topics that enable parallelism
  	Producers: Applications that publish messages to topics
  	Consumers: Applications that subscribe to topics and process messages
  	Brokers: Kafka servers that store messages and serve clients
  	Consumer Groups: Groups of consumers that coordinate to process messages from topics
	Producer API
		KafkaProducer: Main class for sending messages to Kafka
		ProducerRecord: Represents a message to be sent to Kafka
		Callback: Interface for handling asynchronous send results
	Consumer API
		KafkaConsumer: Main class for receiving messages from Kafka
		ConsumerRecord: Represents a message received from Kafka
		ConsumerRebalanceListener: Interface for partition assignment events
	Admin API Classes
		AdminClient: Primary interface for administrative operations
		NewTopic: Specification for creating a new topic
		NewPartitions: Specification for adding partitions
		AlterConfigsOptions: Options for altering configurations
		DescribeTopicsOptions: Options for describing topics
		ListTopicsOptions: Options for listing topics
		DeleteTopicsOptions: Options for deleting topics
	Serialization
		Serde: Combines serializer and deserializer
		Serdes: Factory for common Serde instances
		ByteArraySerializer/ByteArrayDeserializer: For raw byte arrays
		StringSerializer/StringDeserializer: For string data
		IntegerSerializer/IntegerDeserializer: For integer data
		LongSerializer/LongDeserializer: For long integer data
		DoubleSerializer/DoubleDeserializer: For double-precision values
	Connection Management
		BrokerConnection: Class for managing TCP connections to individual Kafka brokers
		ClusterMetadata: Class for tracking topic/partition to broker mappings
		NetworkClient: Low-level client for sending/receiving Kafka protocol requests
	Protocol Implementation
		Protocol Serialization/Deserialization: Classes for encoding/decoding Kafka protocol messages
		Request/Response Handlers: Classes for handling different types of Kafka requests and responses
		ApiVersions: Support for different Kafka protocol versions
	Error Handling
		KafkaError hierarchy: Specialized error classes for different Kafka error scenarios
		RetryPolicy: Interface for handling retries on transient failures

TBC:

	
	Partitioning
		Partitioner interface: Determines how records are assigned to partitions
		DefaultPartitioner: Implementation of Kafka's default partitioning strategy
		RoundRobinPartitioner: Alternative partitioning strategy
	Transactions
		TransactionalProducer: Extension of KafkaProducer with transactional capabilities
		TransactionManager: Manages transaction state and coordination
	Interceptors
		ProducerInterceptor: Interface for intercepting and potentially modifying records before sending
		Extended Consumer Features
	Offset Management
		OffsetCommitCallback: Interface for handling asynchronous offset commits
		AutoOffsetReset: Strategy for handling offset reset scenarios
	Group Coordination
		ConsumerGroupCoordinator: Manages consumer group membership and heartbeats
		ConsumerRebalanceProtocol: Implementation of consumer group rebalance protocols
	Interceptors
		ConsumerInterceptor: Interface for intercepting and potentially modifying records after receiving
	
	Streams API
		Core Abstractions
			KafkaStreams: Main entry point for Kafka Streams applications
			KStream: Represents an unbounded stream of records
			KTable: Represents a changelog stream as a materialized table
		Processing
			Processor API: Low-level stream processing API
			StreamsBuilder: High-level DSL for building stream processing topologies
		State Stores
			StateStore: Interface for persistent key-value stores
			KeyValueStore: Basic key-value store implementation
			WindowStore: Store that supports windowed access patterns
		Operators
			Filter, Map, FlatMap: Basic stream transformation operations
			Join: Operations for joining streams and tables
			Aggregation: Operations for aggregating stream data
