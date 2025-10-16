const { cleanupExpiredEvents } = require('../src/lib/cleanup');
require('dotenv').config({ path: '.env.local' });

async function testCleanup() {
  try {
    console.log('🧹 Testing event cleanup functionality...');
    
    const result = await cleanupExpiredEvents();
    
    console.log(`✅ Cleanup completed successfully!`);
    console.log(`📊 Processed ${result.processed} expired events`);
    
    if (result.processed > 0) {
      console.log('📧 Event summary emails should have been sent to hosts');
    } else {
      console.log('ℹ️  No expired events found to cleanup');
    }
    
  } catch (error) {
    console.error('❌ Cleanup test failed:', error);
  }
}

// Run the test
testCleanup();

